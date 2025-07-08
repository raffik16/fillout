# Multi-Bar Backend Architecture

This document explains the scalable backend architecture for managing multiple bars with their own drink data.

## Overview

The system allows multiple bars to have their own unique URLs (e.g., `drinkjoy.app/bar-name`) and manage their drink data independently. Each bar has its own:
- Drink menu
- Pricing
- Inventory status
- Happy hour schedules
- Theme customization

## Tech Stack

- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API Routes (RESTful)
- **Authentication**: NextAuth.js (implemented with credentials & OAuth)
- **Caching**: Redis (optional, not yet implemented)

## Database Schema

### Core Tables
- `bars` - Stores bar information
- `drinks` - Bar-specific drinks catalog
- `inventory` - Track drink availability
- `happyHours` - Bar-specific happy hour schedules
- `users` & `userBar` - User management and access control
- `categories` & `flavors` - Normalized drink attributes

## API Endpoints

### Bar Management
- `GET /api/bars` - List all bars
- `POST /api/bars` - Create new bar
- `GET /api/bars/[barId]` - Get bar details
- `PUT /api/bars/[barId]` - Update bar
- `DELETE /api/bars/[barId]` - Delete bar
- `GET /api/bars/by-slug/[slug]` - Get bar by URL slug

### Drink Management
- `GET /api/bars/[barId]/drinks` - List bar's drinks
- `POST /api/bars/[barId]/drinks` - Add new drink
- `GET /api/bars/[barId]/drinks/[drinkId]` - Get drink details
- `PUT /api/bars/[barId]/drinks/[drinkId]` - Update drink
- `DELETE /api/bars/[barId]/drinks/[drinkId]` - Delete drink

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database**
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/drinkjoy"
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Seed Database** (optional)
   ```bash
   npx prisma db seed
   ```
   This creates a demo bar with sample drinks.

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Admin Interface

Access the admin interface at `/admin` to:
- Create and manage bars
- Add/edit/delete drinks
- Manage inventory
- View bar statistics

Each bar's drinks can be managed at `/admin/bars/[barId]`.

## Dynamic Bar Pages

Each bar gets its own public page at `/{bar-slug}` (e.g., `/demo-bar`). The page:
- Fetches bar data using the slug
- Displays the drink recommendation wizard
- Shows bar-specific branding (logo, theme)

## Authentication

### Setup
The system uses NextAuth.js for authentication with support for:
- **Credentials**: Email/password login
- **OAuth**: Google and GitHub (when configured)
- **Roles**: superadmin, manager, staff, viewer

### Demo Credentials
- Email: `admin@drinkjoy.app`
- Password: `admin123`
- Role: `superadmin`

### Protected Routes
- `/admin/*` - Requires authentication and at least `staff` role
- Admin API endpoints require appropriate permissions

### Role Hierarchy
1. **superadmin**: Full system access, manage all bars and users
2. **manager**: Manage assigned bars and their staff
3. **staff**: View and edit assigned bars
4. **viewer**: Read-only access (default for new users)

## API Authentication
All admin API routes require authentication. Include the session cookie or use NextAuth.js client methods.

## Next Steps

1. ✅ **Authentication**: NextAuth.js implemented with role-based access
2. **Advanced Features**:
   - Bulk drink import/export
   - Analytics dashboard
   - Customer preferences tracking
   - Multi-language support
   - Bulk drink editing/deleting
3. **Performance**: Add Redis caching for frequently accessed data

## Migration from JSON

To migrate existing drinks from `drinks.json`:
1. Create a bar in the admin interface
2. Run the seed script to import drinks
3. Or use the admin interface to manually add drinks