# Quick Setup Guide

Your multi-bar backend is now ready! Here's how to use it:

## 🚀 Access Points

1. **Admin Dashboard**: http://localhost:3000/admin
   - Create and manage bars
   - Add/edit drinks for each bar
   - View bar statistics

2. **Demo Bar**: http://localhost:3000/demo-bar
   - This is a pre-seeded bar with all your existing drinks
   - Each bar gets its own URL: `/{bar-slug}`

## 📊 Database

Currently using SQLite for local development. The database file is at `prisma/dev.db`.

### To switch to PostgreSQL:

1. Install PostgreSQL locally or use a cloud service
2. Update `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/drinkjoy"
   ```
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations: `npx prisma migrate dev`

## 🔧 Common Commands

- **Start dev server**: `npm run dev`
- **View database**: `npx prisma studio`
- **Reset database**: `npx prisma migrate reset`
- **Seed database**: `npx prisma db seed`

## 🏪 Creating a New Bar

1. Go to http://localhost:3000/admin
2. Click "Add New Bar"
3. Enter bar details:
   - Name: Your bar's name
   - Slug: URL-friendly name (e.g., "my-bar" → drinkjoy.app/my-bar)
   - Location, description, etc.
4. Access your bar at: http://localhost:3000/{your-slug}

## 🍹 Managing Drinks

1. From admin dashboard, click on a bar
2. Add drinks with:
   - Name, category, price
   - ABV%, strength level
   - Description, image URL
   - Inventory status

## 🔐 Next Steps

1. **Authentication**: Add NextAuth.js for secure access
2. **Production Database**: Set up PostgreSQL for production
3. **Domain Setup**: Configure your domain to point to the app
4. **Deployment**: Deploy to Vercel, Railway, or your preferred host