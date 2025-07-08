# Migration and Setup Scripts

This directory contains scripts for initial setup and data migration.

## 🔐 Security Note
**NEVER** commit passwords or sensitive credentials to the repository. Always use environment variables.

## Scripts Overview

### 1. `create-admin.ts` - Initial Admin Setup
Creates the initial superadmin user for the system.

**Usage:**
```bash
# Required: Set admin password via environment variable
ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-admin.ts

# Optional: Set custom admin email (defaults to admin@drinkjoy.app)
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-admin.ts
```

**Environment Variables:**
- `ADMIN_PASSWORD` (required): Secure password for the admin user
- `ADMIN_EMAIL` (optional): Admin email address (default: admin@drinkjoy.app)

### 2. `migrate-bar-owners.ts` - Bar Ownership Migration
Assigns ownership of existing bars to the superadmin user.

**Usage:**
```bash
npx tsx scripts/migrate-bar-owners.ts
```

**When to run:** Once when deploying the role system to ensure all bars have owners.

### 3. `migrate-users-to-new-roles.ts` - User Role Migration
Updates existing user roles to the new role system (user/superadmin).

**Usage:**
```bash
npx tsx scripts/migrate-users-to-new-roles.ts
```

**When to run:** Once when deploying the new role system to migrate existing users.

## 🚀 Deployment Workflow

### First-time Setup (New Environment)
```bash
# 1. Create admin user
ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-admin.ts

# 2. If you have existing bars, assign ownership
npx tsx scripts/migrate-bar-owners.ts

# 3. If you have existing users, migrate their roles
npx tsx scripts/migrate-users-to-new-roles.ts
```

### Production Deployment
1. Set `ADMIN_PASSWORD` in your production environment variables
2. Run the scripts in order as shown above
3. **Never** include passwords in your deployment scripts

## 🔒 Security Best Practices

- ✅ Use strong, unique passwords for admin accounts
- ✅ Store passwords in environment variables or secure vaults
- ✅ Use different passwords for different environments
- ❌ Never commit passwords to version control
- ❌ Never use default or weak passwords in production

## 📝 Notes

- Scripts are idempotent - safe to run multiple times
- Migration scripts should only be run once per environment
- Always backup your database before running migration scripts