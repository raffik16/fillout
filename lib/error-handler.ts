import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // Handle known API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as Record<string, unknown>;
    
    // Handle unique constraint violations
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      );
    }
    
    // Handle foreign key constraint violations
    if (prismaError.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referenced record not found' },
        { status: 400 }
      );
    }
    
    // Handle record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
  }

  // In production, return generic error message
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return NextResponse.json(
    { 
      error: 'Internal server error',
      ...(isDevelopment && error instanceof Error && { details: { message: error.message } })
    },
    { status: 500 }
  );
}

// Helper function to wrap async route handlers
export function withErrorHandler<T extends readonly unknown[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}