/**
 * Reddit Connection Manager
 * Manages Reddit API client initialization and connection
 */

import { RedditClient, RedditConfig } from './client';
import * as dotenv from 'dotenv';

dotenv.config();

let redditClient: RedditClient | null = null;

/**
 * Initialize Reddit client with configuration
 */
export function initializeReddit(config?: Partial<RedditConfig>): RedditClient {
  const clientId = config?.clientId || process.env.REDDIT_CLIENT_ID;
  const clientSecret = config?.clientSecret || process.env.REDDIT_CLIENT_SECRET;
  const username = config?.username || process.env.REDDIT_USERNAME;
  const password = config?.password || process.env.REDDIT_PASSWORD;
  const userAgent = config?.userAgent || process.env.REDDIT_USER_AGENT || 
    `reddit-mcp:1.0.0 (by /u/${username || 'reddit-mcp'})`;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Reddit credentials not found. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.'
    );
  }

  const redditConfig: RedditConfig = {
    clientId,
    clientSecret,
    userAgent,
    username,
    password,
    accessToken: config?.accessToken,
    refreshToken: config?.refreshToken,
  };

  redditClient = new RedditClient(redditConfig);
  return redditClient;
}

/**
 * Get the current Reddit client instance
 */
export function getRedditClient(): RedditClient {
  if (!redditClient) {
    return initializeReddit();
  }
  return redditClient;
}

/**
 * Check if Reddit client is initialized
 */
export function isRedditConnected(): boolean {
  return redditClient !== null;
}

/**
 * Reset Reddit client connection
 */
export function resetRedditConnection(): void {
  redditClient = null;
}

