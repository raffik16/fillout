import { NextResponse } from 'next/server';

/**
 * Security headers to protect against common web vulnerabilities
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Strict transport security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  
  // Content Security Policy - basic protection
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Consider tightening this
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
} as const;

/**
 * API-specific headers for JSON responses
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
} as const;

/**
 * CORS headers for API endpoints
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' // Replace with actual domain in production
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400' // 24 hours
} as const;

/**
 * Apply security headers to a NextResponse
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Apply API headers to a NextResponse
 */
export function applyApiHeaders(response: NextResponse): NextResponse {
  Object.entries(API_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Apply CORS headers to a NextResponse
 */
export function applyCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Create a secure API response with all security headers
 */
export function createSecureApiResponse(data: unknown, options?: { status?: number; headers?: Record<string, string> }): NextResponse {
  const response = NextResponse.json(data, { status: options?.status || 200 });
  
  // Apply security headers
  applySecurityHeaders(response);
  applyApiHeaders(response);
  applyCorsHeaders(response);
  
  // Apply custom headers if provided
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Create an error response with security headers
 */
export function createSecureErrorResponse(error: string, status: number = 500, headers?: Record<string, string>): NextResponse {
  return createSecureApiResponse({ error }, { status, headers });
}