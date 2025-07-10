import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().optional().refine(
  (val) => !val || val === '' || z.string().email().safeParse(val).success,
  { message: 'Invalid email format' }
);
export const urlSchema = z.string().optional().refine(
  (val) => !val || val === '' || z.string().url().safeParse(val).success,
  { message: 'Invalid URL format' }
);
export const priceSchema = z.number().min(0, 'Price cannot be negative').max(9999.99, 'Price too high');
export const percentageSchema = z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100');

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').transform(sanitizeHtml),
  role: z.enum(['user', 'superadmin']).default('user'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  barAssignments: z.array(z.object({
    barId: z.string().min(1, 'Invalid bar ID'),
    role: z.enum(['viewer', 'staff', 'manager', 'owner']).default('staff')
  })).default([])
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(1).max(100).transform(sanitizeHtml).optional(),
  role: z.enum(['user', 'superadmin']).optional(),
  password: z.string().min(8).optional(),
  barAssignments: z.array(z.object({
    barId: z.string().min(1),
    role: z.enum(['viewer', 'staff', 'manager', 'owner'])
  })).optional()
});

// Bar validation schemas
export const createBarSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').transform(sanitizeHtml),
  description: z.string().max(500, 'Description too long').transform(sanitizeHtml).optional(),
  location: z.string().max(200, 'Location too long').transform(sanitizeHtml).optional(),
  email: emailSchema,
  logo: urlSchema
});

export const updateBarSchema = createBarSchema;

// Drink validation schemas
export const createDrinkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').transform(sanitizeHtml),
  category: z.enum(['cocktail', 'beer', 'wine', 'spirit', 'mocktail', 'other']),
  description: z.string().max(500, 'Description too long').transform(sanitizeHtml).optional(),
  price: priceSchema,
  abv: percentageSchema.default(0),
  strength: z.enum(['mocktail', 'light', 'medium', 'strong']),
  glassType: z.string().max(50).transform(sanitizeHtml).optional(),
  preparation: z.string().max(1000).transform(sanitizeHtml).optional(),
  imageUrl: urlSchema,
  featured: z.boolean().default(false),
  happyHourEligible: z.boolean().default(false),
  ingredients: z.array(z.string().transform(sanitizeHtml)).default([]),
  flavorProfile: z.array(z.string().transform(sanitizeHtml)).default([]),
  weatherMatch: z.object({
    temp_min: z.number().optional(),
    temp_max: z.number().optional(),
    ideal_temp: z.number().optional(),
    conditions: z.array(z.string()).optional()
  }).optional(),
  occasions: z.array(z.string().transform(sanitizeHtml)).optional(),
  servingSuggestions: z.array(z.string().transform(sanitizeHtml)).optional()
});

export const updateDrinkSchema = createDrinkSchema.partial();

// Validation error formatter
export function formatValidationErrors(error: z.ZodError): string {
  try {
    // First try to use Zod's built-in formatting
    if (error instanceof z.ZodError) {
      // Try the issues property (most common in Zod)
      if (error.issues && Array.isArray(error.issues)) {
        return error.issues.map((err: { path?: unknown[]; message?: string }) => {
          const path = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
          const message = err.message || 'Invalid value';
          return `${path}: ${message}`;
        }).join(', ');
      }
      
      // Try the errors property (fallback)
      if ((error as unknown as Record<string, unknown>).errors && Array.isArray((error as unknown as Record<string, unknown>).errors)) {
        return ((error as unknown as Record<string, unknown>).errors as Record<string, unknown>[]).map((err: Record<string, unknown>) => {
          const path = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
          const message = err.message || 'Invalid value';
          return `${path}: ${message}`;
        }).join(', ');
      }
    }
    
    // Handle error objects with issues array (fallback)
    if (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues)) {
      return ((error as unknown as Record<string, unknown>).issues as Record<string, unknown>[]).map((err: Record<string, unknown>) => {
        const path = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
        const message = err.message || 'Invalid value';
        return `${path}: ${message}`;
      }).join(', ');
    }
    
    // Handle error objects with errors array (fallback)
    if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as unknown as Record<string, unknown>).errors)) {
      return ((error as unknown as Record<string, unknown>).errors as Record<string, unknown>[]).map((err: Record<string, unknown>) => {
        const path = err.path && Array.isArray(err.path) ? err.path.join('.') : 'unknown';
        const message = err.message || 'Invalid value';
        return `${path}: ${message}`;
      }).join(', ');
    }
    
    // Log the error structure for debugging
    console.error('Unexpected error structure in formatValidationErrors:', {
      error,
      type: typeof error,
      isZodError: error instanceof z.ZodError,
      hasErrors: !!(error as unknown as Record<string, unknown>)?.errors,
      hasIssues: !!(error as unknown as Record<string, unknown>)?.issues,
      keys: error ? Object.keys(error) : 'null',
      stringified: JSON.stringify(error, null, 2)
    });
    
    return 'Validation failed';
  } catch (e) {
    console.error('Error formatting validation errors:', e, 'Original error:', error);
    return 'Validation failed';
  }
}