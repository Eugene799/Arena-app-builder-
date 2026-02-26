import type { RateLimitConfig, RateLimitState } from '../types';

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config;
  }

  setConfig(config: RateLimitConfig) {
    this.config = config;
  }

  private getClientKey(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  check(key: string = 'default'): RateLimitState {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length);
    const reset = now + this.config.windowMs;
    
    return {
      remaining,
      reset,
      blocked: remaining === 0 && timestamps.length >= this.config.maxRequests,
    };
  }

  consume(key: string = 'default'): RateLimitState {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    if (timestamps.length >= this.config.maxRequests) {
      return {
        remaining: 0,
        reset: now + this.config.windowMs,
        blocked: true,
      };
    }
    
    timestamps.push(now);
    this.requests.set(key, timestamps);
    
    return {
      remaining: this.config.maxRequests - timestamps.length,
      reset: now + this.config.windowMs,
      blocked: false,
    };
  }

  reset(key: string = 'default') {
    this.requests.delete(key);
  }

  resetAll() {
    this.requests.clear();
  }

  getConfig(): RateLimitConfig {
    return { ...this.config };
  }
}

class TokenBucket {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(maxTokens: number = 100, refillRate: number = 10) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / 1000) * this.refillRate;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  consume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  getRemainingCapacity(): number {
    return this.maxTokens - this.tokens;
  }
}

const defaultRateLimiter = new RateLimiter();
const aiRateLimiter = new RateLimiter({ maxRequests: 50, windowMs: 60000 });
const transactionRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 });

export const rateLimiter = defaultRateLimiter;
export const aiRateLimit = aiRateLimiter;
export const transactionRateLimit = transactionRateLimiter;

export const checkRateLimit = (key?: string): RateLimitState => {
  return defaultRateLimiter.check(key);
};

export const consumeRateLimit = (key?: string): RateLimitState => {
  return defaultRateLimiter.consume(key);
};

export const checkAiRateLimit = (): RateLimitState => {
  return aiRateLimiter.consume('ai');
};

export const checkTransactionRateLimit = (): RateLimitState => {
  return transactionRateLimiter.consume('transaction');
};

export { RateLimiter, TokenBucket };
