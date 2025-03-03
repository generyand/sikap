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
      
      // Check if specific tables exist and create them if needed
      // This adds the direct SQL approach from databaseService.ts
      await this.ensureTablesExist();
      
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
        const profile = await models.Profile.create({
          name: 'Default User',
          theme: 'light'
        });
        console.log('Default profile created successfully:', profile.get('id'));
      }
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
  
  // Added from databaseService.ts - direct SQL table creation
  private async ensureTablesExist() {
    try {
      // Check if profiles table exists
      const tableExists = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles';"
      );
      
      if (!tableExists[0].length) {
        // Create profiles table using direct SQL
        await sequelize.query(`
          CREATE TABLE profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            avatar TEXT,
            theme TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("Created profiles table via SQL");
      }
      
      // Add logic for other tables if needed
    } catch (error) {
      console.error("Table existence check failed:", error);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await sequelize.authenticate();
      
      // Debug the database path - use proper typing
      const dbPath = (sequelize as any).options?.storage;
      if (dbPath) {
        console.log('📁 Database file location:', dbPath);
      }
      
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
      // Use get method for type safety
      console.log('Created test profile:', testProfile.get('id'));
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
    await db.connect(); // Call connect instead of just checking connection
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
} 