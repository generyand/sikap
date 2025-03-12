const { seed: developmentSeed } = require('./development');

async function runSeeders() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Starting database seeding...');
      await developmentSeed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error running seeders:', error);
      process.exit(1);
    }
  } else {
    console.log('Skipping seeders in production environment');
  }
}

module.exports = {
  runSeeders
}; 