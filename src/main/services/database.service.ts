import { sequelize, models } from '../database/models';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    // Initialize the database
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect() {
    try {
      // Authenticate and sync the database
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Sync all models with the database
      // Force: false means it won't drop tables if they exist
      await sequelize.sync({ force: false });
      console.log('Database synchronized successfully');
      
      // Check if there are profiles
      const profileCount = await models.Profile.count();
      console.log(`Found ${profileCount} profiles in database`);
      
      // Create a default profile if none exists
      if (profileCount === 0) {
        console.log('Creating default profile...');
        await models.Profile.create({
          name: 'Default User',
          theme: 'light'
        });
        console.log('Default profile created successfully');
      }
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async checkConnection(): Promise<void> {
    const maxRetries = 5;
    let currentTry = 0;

    while (currentTry < maxRetries) {
      try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        return;
      } catch (error) {
        currentTry++;
        console.error(`❌ Database connection attempt ${currentTry} failed:`, error);
        if (currentTry === maxRetries) {
          throw new Error('Database connection failed after maximum retries');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async disconnect(): Promise<void> {
    await sequelize.close();
  }

  // Access to models
  get profile() {
    return models.Profile;
  }

  get task() {
    return models.Task;
  }
} 