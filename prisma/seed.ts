import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';
// import drinksData from '../data/drinks.json';
const drinksData: { drinks: Record<string, unknown>[] } = { drinks: [] };

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

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@drinkjoy.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hashPassword(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'superadmin',
    },
  });

  console.log(`Created/Updated admin user: ${adminUser.email}`);

  // Create sample drinks
  const sampleDrinks = [
    {
      name: 'Classic Margarita',
      category: 'cocktail',
      description: 'A refreshing tequila-based cocktail with lime and triple sec',
      price: 12.00,
      abv: 15.0,
      strength: 'medium',
      glassType: 'Margarita Glass',
      preparation: 'Shake with ice, strain into glass with salt rim',
      ingredients: ['Tequila', 'Triple Sec', 'Lime Juice', 'Salt'],
      flavorProfile: ['Citrus', 'Sour', 'Refreshing'],
      happyHourEligible: true,
    },
    {
      name: 'Old Fashioned',
      category: 'cocktail',
      description: 'A classic whiskey cocktail with sugar and bitters',
      price: 14.00,
      abv: 25.0,
      strength: 'strong',
      glassType: 'Old Fashioned Glass',
      preparation: 'Muddle sugar with bitters, add whiskey and ice',
      ingredients: ['Whiskey', 'Sugar', 'Angostura Bitters', 'Orange Peel'],
      flavorProfile: ['Smooth', 'Bitter', 'Caramel'],
      happyHourEligible: true,
    },
    {
      name: 'Craft IPA',
      category: 'beer',
      description: 'Hoppy India Pale Ale with citrus notes',
      price: 8.00,
      abv: 6.5,
      strength: 'medium',
      glassType: 'Pint Glass',
      preparation: 'Serve chilled',
      ingredients: ['Hops', 'Malt', 'Yeast', 'Water'],
      flavorProfile: ['Bitter', 'Citrus', 'Hoppy'],
      happyHourEligible: true,
    },
    {
      name: 'Cabernet Sauvignon',
      category: 'wine',
      description: 'Full-bodied red wine with dark fruit flavors',
      price: 10.00,
      abv: 13.5,
      strength: 'medium',
      glassType: 'Wine Glass',
      preparation: 'Serve at room temperature',
      ingredients: ['Cabernet Sauvignon Grapes'],
      flavorProfile: ['Berry', 'Smooth', 'Rich'],
      happyHourEligible: false,
    },
    {
      name: 'Mojito',
      category: 'cocktail',
      description: 'Refreshing rum cocktail with mint and lime',
      price: 11.00,
      abv: 12.0,
      strength: 'light',
      glassType: 'Highball Glass',
      preparation: 'Muddle mint with lime, add rum and soda water',
      ingredients: ['White Rum', 'Fresh Mint', 'Lime Juice', 'Soda Water', 'Sugar'],
      flavorProfile: ['Mint', 'Citrus', 'Refreshing'],
      happyHourEligible: true,
    },
  ];

  let createdCount = 0;
  for (const drink of sampleDrinks) {
    try {
      const createdDrink = await prisma.drink.create({
        data: {
          barId: demoBar.id,
          name: drink.name,
          category: drink.category,
          description: drink.description,
          price: drink.price,
          abv: drink.abv,
          strength: drink.strength,
          glassType: drink.glassType,
          preparation: drink.preparation,
          happyHourEligible: drink.happyHourEligible,
          ingredients: drink.ingredients,
          flavorProfile: drink.flavorProfile,
          weatherMatch: undefined,
          occasions: [],
          servingSuggestions: [],
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