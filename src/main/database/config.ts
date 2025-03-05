import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';
import { is } from '@electron-toolkit/utils';

// Get the app data path for storing the database
const userDataPath = app.getPath('userData');
const dbPath = is.dev 
  ? path.join(userDataPath, 'dev-database.sqlite')
  : path.join(userDataPath, 'database.sqlite');

console.log('Database path:', dbPath); // Add this for debugging

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Disable logging in production
  define: {
    timestamps: true, // Adds createdAt and updatedAt timestamps to every model
    underscored: true, // Use snake_case for fields in the database
  }
});

export default sequelize; 