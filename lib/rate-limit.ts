import { NextRequest } from 'next/server';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (for development/simple deployments)
// In production, consider using Redis or similar
const store = new Map<string, RateLimitData>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (now > data.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export function createRateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs, message = 'Too many requests' } = options;

  return function rateLimit(request: NextRequest): { isAllowed: boolean; error?: string; headers?: Record<string, string> } {
    // Get client identifier (IP address)
    const clientIP = getClientIP(request);
    const key = `rate_limit:${clientIP}`;
    
    const now = Date.now();
    const data = store.get(key);

    if (!data || now > data.resetTime) {
      // First request or window expired
      store.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      
      return {
        isAllowed: true,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': (maxRequests - 1).toString(),
          'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
        }
      };
    }

    if (data.count >= maxRequests) {
      // Rate limit exceeded
      return {
        isAllowed: false,
        error: message,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(data.resetTime).toISOString(),
          'Retry-After': Math.ceil((data.resetTime - now) / 1000).toString()
        }
      };
    }

    // Increment counter
    data.count++;
    store.set(key, data);

    return {
      isAllowed: true,
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - data.count).toString(),
        'X-RateLimit-Reset': new Date(data.resetTime).toISOString()
      }
    };
  };
}

function getClientIP(request: NextRequest): string {
  // Try various headers for getting client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for') || 
                    request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return remoteAddr || 'unknown';
}

// Pre-configured rate limiters for different use cases
export const apiRateLimit = createRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many API requests. Please try again later.'
});

export const authRateLimit = createRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
});

export const strictRateLimit = createRateLimit({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Rate limit exceeded. Please try again later.'
});