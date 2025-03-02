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

  async checkConnection(): Promise<boolean> {
    try {
      await sequelize.authenticate();
      
      // Debug the database path
      const dbPath = sequelize.options.storage;
      console.log('📁 Database file location:', dbPath);
      
      return true;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return false;
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

  async initModels() {
    // This method is now empty as the initialization logic is moved to the connect method
  }
}

// Export the test function so it can be imported elsewhere
export async function testDatabaseWithSampleProfile() {
  try {
    const dbService = DatabaseService.getInstance();
    
    // Check if any profiles exist
    const profileCount = await dbService.profile.count();
    console.log(`Database has ${profileCount} profiles`);
    
    // If no profiles exist, create a test profile
    if (profileCount === 0) {
      const testProfile = await dbService.profile.create({
        name: 'Test User',
        avatar: null,
        theme: 'light'
      });
      console.log('Created test profile:', testProfile.id);
    }
    
    return true;
  } catch (error) {
    console.error('Test profile creation failed:', error);
    return false;
  }
}

export async function initializeDatabase() {
  try {
    const db = DatabaseService.getInstance();
    
    // Just check connection and log info, don't try to create test profile
    // as the connect method already handles this
    await db.checkConnection();
    
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
} 