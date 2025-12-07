/**
 * Reddit API Client
 * Handles OAuth authentication and API requests to Reddit
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface RedditListingResponse<T> {
  kind: string;
  data: {
    after: string | null;
    before: string | null;
    dist: number;
    modhash: string | null;
    geo_filter: string;
    children: Array<{
      kind: string;
      data: T;
    }>;
  };
}

export interface RedditPost {
  id: string;
  name: string;
  title: string;
  selftext: string;
  selftext_html: string | null;
  url: string;
  author: string;
  subreddit: string;
  subreddit_id: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  created_utc: number;
  is_self: boolean;
  is_video: boolean;
  over_18: boolean;
  stickied: boolean;
  locked: boolean;
  archived: boolean;
  permalink: string;
  thumbnail: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
}

export interface RedditComment {
  id: string;
  name: string;
  body: string;
  body_html: string | null;
  author: string;
  score: number;
  created_utc: number;
  parent_id: string;
  link_id: string;
  subreddit: string;
  is_submitter: boolean;
  stickied: boolean;
  permalink: string;
  replies?: RedditListingResponse<RedditComment>;
}

export interface RedditSubreddit {
  id: string;
  name: string;
  display_name: string;
  title: string;
  description: string;
  description_html: string | null;
  public_description: string;
  subscribers: number;
  active_user_count: number | null;
  created_utc: number;
  over18: boolean;
  lang: string;
  subreddit_type: string;
  url: string;
}

export interface RedditUser {
  id: string;
  name: string;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  verified: boolean;
  has_verified_email: boolean;
  subreddit?: {
    display_name: string;
    title: string;
    description: string;
  };
}

export class RedditClient {
  private config: RedditConfig;
  private axiosInstance: AxiosInstance;
  private tokenExpiry: number = 0;

  constructor(config: RedditConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'User-Agent': config.userAgent,
      },
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(async (config) => {
      await this.ensureAuthenticated();
      if (this.config.accessToken) {
        config.headers.Authorization = `Bearer ${this.config.accessToken}`;
      }
      return config;
    });
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAuthenticated(): Promise<void> {
    // If we have a token and it's not expired, use it
    if (this.config.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    // If we have a refresh token, use it
    if (this.config.refreshToken) {
      await this.refreshAccessToken();
      return;
    }

    // Otherwise, get a new token
    await this.authenticate();
  }

  /**
   * Authenticate with Reddit using client credentials or user credentials
   */
  private async authenticate(): Promise<void> {
    const authUrl = 'https://www.reddit.com/api/v1/access_token';
    const params = new URLSearchParams();

    if (this.config.username && this.config.password) {
      // User credentials flow
      params.append('grant_type', 'password');
      params.append('username', this.config.username);
      params.append('password', this.config.password);
    } else {
      // Client credentials flow (read-only, no user context)
      params.append('grant_type', 'client_credentials');
    }

    try {
      const response = await axios.post<RedditTokenResponse>(
        authUrl,
        params,
        {
          headers: {
            'User-Agent': this.config.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret,
          },
        }
      );

      this.config.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.config.refreshToken = response.data.refresh_token;
      }
      // Set expiry to 45 minutes (tokens typically last 1 hour)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 900) * 1000;
    } catch (error: any) {
      throw new Error(
        `Failed to authenticate with Reddit: ${error.response?.data?.error || error.message}`
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const authUrl = 'https://www.reddit.com/api/v1/access_token';
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.config.refreshToken);

    try {
      const response = await axios.post<RedditTokenResponse>(
        authUrl,
        params,
        {
          headers: {
            'User-Agent': this.config.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: this.config.clientId,
            password: this.config.clientSecret,
          },
        }
      );

      this.config.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.config.refreshToken = response.data.refresh_token;
      }
      this.tokenExpiry = Date.now() + (response.data.expires_in - 900) * 1000;
    } catch (error: any) {
      // If refresh fails, try to authenticate again
      this.config.refreshToken = undefined;
      await this.authenticate();
    }
  }

  /**
   * Make a GET request to Reddit API
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Reddit API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Make a POST request to Reddit API
   */
  private async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Reddit API error: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get posts from a subreddit
   */
  async getSubredditPosts(
    subreddit: string,
    sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial' = 'hot',
    limit: number = 25,
    after?: string,
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<RedditListingResponse<RedditPost>> {
    const endpoint = `/r/${subreddit}/${sort}.json`;
    const params: Record<string, any> = { limit };
    if (after) params.after = after;
    if (time && (sort === 'top' || sort === 'controversial')) params.t = time;
    return this.get<RedditListingResponse<RedditPost>>(endpoint, params);
  }

  /**
   * Get front page posts (best, hot, new, top, rising, controversial)
   */
  async getFrontPagePosts(
    sort: 'best' | 'hot' | 'new' | 'top' | 'rising' | 'controversial' = 'hot',
    limit: number = 25,
    after?: string,
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<RedditListingResponse<RedditPost>> {
    const endpoint = `/${sort}.json`;
    const params: Record<string, any> = { limit };
    if (after) params.after = after;
    if (time && (sort === 'top' || sort === 'controversial')) params.t = time;
    return this.get<RedditListingResponse<RedditPost>>(endpoint, params);
  }

  /**
   * Get popular subreddits
   */
  async getPopularSubreddits(
    limit: number = 25,
    after?: string
  ): Promise<RedditListingResponse<RedditSubreddit>> {
    const endpoint = '/subreddits/popular.json';
    const params: Record<string, any> = { limit };
    if (after) params.after = after;
    return this.get<RedditListingResponse<RedditSubreddit>>(endpoint, params);
  }

  /**
   * Get new subreddits
   */
  async getNewSubreddits(
    limit: number = 25,
    after?: string
  ): Promise<RedditListingResponse<RedditSubreddit>> {
    const endpoint = '/subreddits/new.json';
    const params: Record<string, any> = { limit };
    if (after) params.after = after;
    return this.get<RedditListingResponse<RedditSubreddit>>(endpoint, params);
  }

  /**
   * Search subreddits by name or description
   */
  async searchSubreddits(
    query: string,
    limit: number = 25,
    after?: string
  ): Promise<RedditListingResponse<RedditSubreddit>> {
    const endpoint = '/subreddits/search.json';
    const params: Record<string, any> = { q: query, limit };
    if (after) params.after = after;
    return this.get<RedditListingResponse<RedditSubreddit>>(endpoint, params);
  }

  /**
   * Get user overview (posts and comments combined)
   */
  async getUserOverview(
    username: string,
    sort: 'hot' | 'new' | 'top' | 'controversial' = 'new',
    limit: number = 25,
    after?: string,
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<RedditListingResponse<RedditPost | RedditComment>> {
    const endpoint = `/user/${username}/overview.json`;
    const params: Record<string, any> = { sort, limit };
    if (after) params.after = after;
    if (time && (sort === 'top' || sort === 'controversial')) params.t = time;
    return this.get<RedditListingResponse<RedditPost | RedditComment>>(endpoint, params);
  }

  /**
   * Get comments for a post
   */
  async getPostComments(
    subreddit: string,
    postId: string,
    sort: 'confidence' | 'top' | 'new' | 'controversial' | 'old' | 'random' | 'qa' | 'live' = 'top',
    limit: number = 25
  ): Promise<Array<RedditListingResponse<RedditComment>>> {
    const endpoint = `/r/${subreddit}/comments/${postId}.json`;
    const params = { sort, limit };
    return this.get<Array<RedditListingResponse<RedditComment>>>(endpoint, params);
  }

  /**
   * Search Reddit
   */
  async search(
    query: string,
    subreddit?: string,
    sort: 'relevance' | 'hot' | 'top' | 'new' | 'comments' = 'relevance',
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all',
    limit: number = 25,
    after?: string
  ): Promise<RedditListingResponse<RedditPost>> {
    const endpoint = subreddit ? `/r/${subreddit}/search.json` : '/search.json';
    const params: Record<string, any> = { q: query, sort, limit };
    if (time) params.t = time;
    if (after) params.after = after;
    return this.get<RedditListingResponse<RedditPost>>(endpoint, params);
  }

  /**
   * Get subreddit information
   */
  async getSubredditInfo(subreddit: string): Promise<RedditSubreddit> {
    const endpoint = `/r/${subreddit}/about.json`;
    const response = await this.get<{ kind: string; data: RedditSubreddit }>(endpoint);
    return response.data;
  }

  /**
   * Get user information
   */
  async getUserInfo(username: string): Promise<RedditUser> {
    const endpoint = `/user/${username}/about.json`;
    const response = await this.get<{ kind: string; data: RedditUser }>(endpoint);
    return response.data;
  }

  /**
   * Get user's posts
   */
  async getUserPosts(
    username: string,
    sort: 'hot' | 'new' | 'top' | 'controversial' = 'new',
    limit: number = 25,
    after?: string,
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<RedditListingResponse<RedditPost>> {
    const endpoint = `/user/${username}/submitted.json`;
    const params: Record<string, any> = { sort, limit };
    if (after) params.after = after;
    if (time && (sort === 'top' || sort === 'controversial')) params.t = time;
    return this.get<RedditListingResponse<RedditPost>>(endpoint, params);
  }

  /**
   * Get user's comments
   */
  async getUserComments(
    username: string,
    sort: 'hot' | 'new' | 'top' | 'controversial' = 'new',
    limit: number = 25,
    after?: string,
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<RedditListingResponse<RedditComment>> {
    const endpoint = `/user/${username}/comments.json`;
    const params: Record<string, any> = { sort, limit };
    if (after) params.after = after;
    if (time && (sort === 'top' || sort === 'controversial')) params.t = time;
    return this.get<RedditListingResponse<RedditComment>>(endpoint, params);
  }

  /**
   * Get post by ID
   */
  async getPost(subreddit: string, postId: string): Promise<RedditPost> {
    const endpoint = `/r/${subreddit}/comments/${postId}.json`;
    const response = await this.get<Array<any>>(endpoint);
    const postData = response[0]?.data?.children?.[0]?.data;
    if (!postData) {
      throw new Error('Post not found');
    }
    return postData;
  }

  /**
   * Get current user info (requires user authentication)
   */
  async getMe(): Promise<RedditUser> {
    const endpoint = '/api/v1/me';
    return this.get<RedditUser>(endpoint);
  }

  /**
   * Submit a post to a subreddit
   * Requires user authentication (username/password)
   */
  async submitPost(params: {
    subreddit: string;
    title: string;
    kind: 'link' | 'self' | 'image';
    text?: string;
    url?: string;
    sendreplies?: boolean;
    nsfw?: boolean;
    spoiler?: boolean;
    flairId?: string;
    flairText?: string;
  }): Promise<any> {
    if (!this.config.username || !this.config.password) {
      throw new Error('User authentication required for posting. Please provide REDDIT_USERNAME and REDDIT_PASSWORD.');
    }

    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('sr', params.subreddit.replace(/^r\//, ''));
    formData.append('title', params.title);
    formData.append('kind', params.kind);

    if (params.kind === 'link' && params.url) {
      formData.append('url', params.url);
    } else if (params.kind === 'image' && params.url) {
      // For image posts, url should be a Reddit-hosted image URL
      formData.append('url', params.url);
    } else if (params.kind === 'self' && params.text) {
      formData.append('text', params.text);
    }

    if (params.sendreplies !== undefined) {
      formData.append('sendreplies', params.sendreplies.toString());
    }
    if (params.nsfw !== undefined) {
      formData.append('nsfw', params.nsfw.toString());
    }
    if (params.spoiler !== undefined) {
      formData.append('spoiler', params.spoiler.toString());
    }
    if (params.flairId) {
      formData.append('flair_id', params.flairId);
    }
    if (params.flairText) {
      formData.append('flair_text', params.flairText);
    }

    const endpoint = '/api/submit';
    return this.post<any>(endpoint, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Upload an image to Imgur and return the URL
   * Imgur allows anonymous uploads without API key for basic usage
   */
  async uploadImageToImgur(imageUrl: string): Promise<string> {
    try {
      // First, fetch the image if it's a URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        maxContentLength: 20 * 1024 * 1024, // 20MB limit
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const base64Image = imageBuffer.toString('base64');

      // Upload to Imgur (anonymous API)
      const uploadResponse = await axios.post(
        'https://api.imgur.com/3/image',
        {
          image: base64Image,
          type: 'base64',
        },
        {
          headers: {
            'Authorization': 'Client-ID 546c25a59c58ad7', // Imgur's public anonymous client ID
            'Content-Type': 'application/json',
          },
        }
      );

      if (uploadResponse.data.success && uploadResponse.data.data?.link) {
        return uploadResponse.data.data.link;
      } else {
        throw new Error(`Imgur upload failed: ${uploadResponse.data.data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      if (error.response?.data?.data?.error) {
        throw new Error(`Imgur upload failed: ${error.response.data.data.error}`);
      }
      throw new Error(`Failed to upload image to Imgur: ${error.message}`);
    }
  }

  /**
   * Submit a comment or reply
   * Requires user authentication (username/password)
   */
  async submitComment(params: {
    parentId: string; // Fullname (e.g., t3_xxxxx for post, t1_xxxxx for comment)
    text: string;
  }): Promise<any> {
    if (!this.config.username || !this.config.password) {
      throw new Error('User authentication required for commenting. Please provide REDDIT_USERNAME and REDDIT_PASSWORD.');
    }

    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('thing_id', params.parentId);
    formData.append('text', params.text);

    const endpoint = '/api/comment';
    return this.post<any>(endpoint, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Edit a post or comment
   * Requires user authentication (username/password)
   */
  async editPostOrComment(params: {
    thingId: string; // Fullname (e.g., t3_xxxxx for post, t1_xxxxx for comment)
    text: string;
  }): Promise<any> {
    if (!this.config.username || !this.config.password) {
      throw new Error('User authentication required for editing. Please provide REDDIT_USERNAME and REDDIT_PASSWORD.');
    }

    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('thing_id', params.thingId);
    formData.append('text', params.text);

    const endpoint = '/api/editusertext';
    return this.post<any>(endpoint, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Delete a post or comment
   * Requires user authentication (username/password)
   */
  async deletePostOrComment(thingId: string): Promise<any> {
    if (!this.config.username || !this.config.password) {
      throw new Error('User authentication required for deleting. Please provide REDDIT_USERNAME and REDDIT_PASSWORD.');
    }

    const formData = new URLSearchParams();
    formData.append('id', thingId);

    const endpoint = '/api/del';
    return this.post<any>(endpoint, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

