import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUsersToNewRoles() {
  try {
    console.log('Starting user role migration...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        bars: {
          select: {
            barId: true,
            role: true,
            bar: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`Processing user: ${user.email} (current role: ${user.role})`);

      // Update user role based on current role
      let newRole: string;
      if (user.role === 'superadmin') {
        newRole = 'superadmin';
        console.log(`  - Keeping as superadmin`);
      } else {
        newRole = 'user';
        console.log(`  - Converting to regular user`);
      }

      // Update the user's role
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      });

      console.log(`  - Updated ${user.email} role to: ${newRole}`);
      
      if (user.bars && user.bars.length > 0) {
        console.log(`  - Has ${user.bars.length} bar assignments:`);
        user.bars.forEach(userBar => {
          console.log(`    - ${userBar.bar.name}: ${userBar.role}`);
        });
      } else if (newRole === 'user') {
        console.log(`  - WARNING: User ${user.email} has no bar assignments!`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error migrating user roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToNewRoles();