import { PrismaClient } from '@prisma/client';
import drinksData from '../data/drinks.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a demo bar
  const demoBar = await prisma.bar.upsert({
    where: { slug: 'demo-bar' },
    update: {},
    create: {
      slug: 'demo-bar',
      name: 'Demo Bar',
      description: 'A demo bar for testing',
      location: 'New York, NY',
      email: 'demo@drinkjoy.app',
      theme: {
        primaryColor: '#ff6b35',
        secondaryColor: '#f7931e',
      },
    },
  });

  console.log(`Created/Updated bar: ${demoBar.name}`);

  // Migrate drinks from JSON
  const drinks = drinksData.drinks;
  let createdCount = 0;

  for (const drink of drinks) {
    try {
      const createdDrink = await prisma.drink.create({
        data: {
          barId: demoBar.id,
          name: drink.name,
          category: drink.category,
          description: drink.description,
          price: drink.price ? parseFloat(drink.price.replace('$', '')) : 10.00,
          abv: drink.abv,
          strength: drink.strength,
          glassType: drink.glass_type,
          preparation: drink.preparation,
          imageUrl: drink.image_url,
          happyHourEligible: drink.happy_hour || false,
          ingredients: drink.ingredients || [],
          flavorProfile: drink.flavor_profile || [],
          weatherMatch: drink.weather_match || null,
          occasions: drink.occasions || [],
          servingSuggestions: drink.serving_suggestions || [],
        },
      });

      // Create inventory record
      await prisma.inventory.create({
        data: {
          barId: demoBar.id,
          drinkId: createdDrink.id,
          inStock: true,
        },
      });

      createdCount++;
    } catch (error) {
      console.error(`Error creating drink ${drink.name}:`, error);
    }
  }

  console.log(`Created ${createdCount} drinks`);

  // Create happy hour schedules
  const happyHours = [
    { dayOfWeek: 1, startTime: '16:00', endTime: '19:00', discount: 20 }, // Monday
    { dayOfWeek: 2, startTime: '16:00', endTime: '19:00', discount: 20 }, // Tuesday
    { dayOfWeek: 3, startTime: '16:00', endTime: '19:00', discount: 20 }, // Wednesday
    { dayOfWeek: 4, startTime: '16:00', endTime: '19:00', discount: 20 }, // Thursday
    { dayOfWeek: 5, startTime: '15:00', endTime: '20:00', discount: 25 }, // Friday
  ];

  for (const hh of happyHours) {
    await prisma.happyHour.create({
      data: {
        barId: demoBar.id,
        ...hh,
      },
    });
  }

  console.log('Created happy hour schedules');

  // Create sample categories
  const categories = ['Sweet', 'Bitter', 'Sour', 'Smooth', 'Spicy', 'Herbal', 'Fruity', 'Refreshing'];
  
  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }

  console.log('Created categories');

  // Create sample flavors
  const flavors = ['Citrus', 'Berry', 'Tropical', 'Vanilla', 'Caramel', 'Chocolate', 'Mint', 'Ginger'];
  
  for (const flavorName of flavors) {
    await prisma.flavor.upsert({
      where: { name: flavorName },
      update: {},
      create: { name: flavorName },
    });
  }

  console.log('Created flavors');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });