/**
 * Request Throttler
 * Proactively enforces Reddit's OAuth rate limit (100 QPM / 10-min rolling window)
 * by maintaining a minimum delay between requests and adapting to rate-limit headers.
 */

import { REDDIT_RATE_LIMIT } from '../config/constants';

export interface RateLimitState {
  remaining: number;
  resetSeconds: number;
  used: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RequestThrottler {
  private lastRequestAt = 0;
  private state: RateLimitState | null = null;

  private readonly minDelayMs = REDDIT_RATE_LIMIT.MIN_DELAY_MS;
  private readonly lowThreshold = REDDIT_RATE_LIMIT.LOW_REMAINING_THRESHOLD;
  private readonly maxDelayMs = REDDIT_RATE_LIMIT.MAX_COMPUTED_DELAY_MS;

  /**
   * Wait if needed before issuing a request.
   * Enforces minimum delay and backs off proactively when quota is low.
   */
  async throttle(): Promise<void> {
    const delay = this.computeDelay();
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < delay) {
      await sleep(delay - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  /**
   * Update internal rate-limit state from Reddit's response headers.
   * Call this after every successful API response.
   */
  updateFromHeaders(headers: Record<string, string>): void {
    const remainingRaw = headers['x-ratelimit-remaining'];
    const resetRaw = headers['x-ratelimit-reset'];
    const usedRaw = headers['x-ratelimit-used'];

    if (remainingRaw === undefined) {
      return;
    }

    const remaining = Math.floor(parseFloat(remainingRaw));
    const resetSeconds = parseInt(resetRaw ?? '60', 10);
    const used = parseInt(usedRaw ?? '0', 10);

    this.state = { remaining, resetSeconds, used };

    if (remaining < this.lowThreshold) {
      console.error(
        `⚠️  Rate limit low: ${remaining} requests remaining, resets in ${resetSeconds}s`
      );
    }
  }

  private computeDelay(): number {
    if (!this.state || this.state.remaining >= this.lowThreshold) {
      return this.minDelayMs;
    }
    if (this.state.remaining <= 0) {
      return this.maxDelayMs;
    }
    // Spread remaining quota evenly across the reset window
    const msPerRequest = (this.state.resetSeconds * 1000) / this.state.remaining;
    return Math.min(Math.max(msPerRequest, this.minDelayMs), this.maxDelayMs);
  }
}
