import sequelize from '../database/config';
import path from 'path';
import fs from 'fs';
import Task from '../database/models/task.model';
import Profile from '../database/models/profile.model';
import Notification from '../database/models/notification.model';

export class DatabaseService {
  private static instance: DatabaseService;
  readonly sequelize = sequelize;
  readonly task = Task;
  readonly profile = Profile;
  readonly notification = Notification;

  private constructor() {
    // Initialize associations
    Task.associate({ Profile, Notification });
    Profile.associate({ Task });
    Notification.associate({ Task, Profile });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect() {
    try {
      // Log the database path
      const dbPath = (sequelize as any).options?.storage;
      console.log('Attempting to connect to database at:', dbPath);

      // Authenticate and sync the database
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      
      // Ensure the database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('Created database directory:', dbDir);
      }
      
      // Force sync all models with the database since we added a new required field
      await sequelize.sync({ force: true });
      console.log('Database synchronized successfully - Tables recreated with new schema');
      
      return true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
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