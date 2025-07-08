import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBarOwners() {
  try {
    // Get all bars that don't have owners
    const barsWithoutOwners = await prisma.bar.findMany({
      where: {
        users: {
          none: {
            role: 'owner'
          }
        }
      },
      include: {
        users: true
      }
    });

    console.log(`Found ${barsWithoutOwners.length} bars without owners`);

    // Get the superadmin user to assign as default owner
    const superadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    });

    if (!superadmin) {
      console.error('No superadmin user found!');
      return;
    }

    // Assign superadmin as owner to all bars without owners
    for (const bar of barsWithoutOwners) {
      console.log(`Assigning owner to bar: ${bar.name}`);
      
      await prisma.userBar.create({
        data: {
          userId: superadmin.id,
          barId: bar.id,
          role: 'owner'
        }
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error migrating bar owners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBarOwners();