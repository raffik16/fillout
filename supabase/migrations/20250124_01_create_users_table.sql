-- Migration: Create users table for Clerk integration
-- Purpose: Store Clerk user data and enable user-specific features
-- Date: 2025-01-24

-- Create users table to store Clerk user information
CREATE TABLE IF NOT EXISTS users (
    -- Primary key using Clerk user ID
    id TEXT PRIMARY KEY,
    
    -- Clerk-specific fields
    clerk_user_id TEXT NOT NULL UNIQUE,
    email TEXT,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    
    -- User preferences and settings
    preferred_categories TEXT[], -- Array of preferred drink categories
    dietary_restrictions TEXT[], -- Array of dietary restrictions/allergies
    flavor_preferences TEXT[], -- Array of preferred flavors
    
    -- Metadata
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own profile" 
    ON users FOR SELECT 
    USING (auth.uid()::text = clerk_user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" 
    ON users FOR UPDATE 
    USING (auth.uid()::text = clerk_user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores Clerk user information and preferences';
COMMENT ON COLUMN users.id IS 'Primary key - matches Clerk user ID';
COMMENT ON COLUMN users.clerk_user_id IS 'Unique identifier from Clerk authentication';
COMMENT ON COLUMN users.preferred_categories IS 'User preferred drink categories (cocktails, beer, wine, etc.)';
COMMENT ON COLUMN users.dietary_restrictions IS 'User dietary restrictions and allergies';
COMMENT ON COLUMN users.flavor_preferences IS 'User flavor preferences from wizard';