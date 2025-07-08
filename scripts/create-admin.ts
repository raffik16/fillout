import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@drinkjoy.app';
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('❌ ERROR: ADMIN_PASSWORD environment variable is required for security.');
      console.log('Usage: ADMIN_PASSWORD=your_secure_password npx tsx scripts/create-admin.ts');
      process.exit(1);
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'superadmin'
      }
    });

    console.log('✅ Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();