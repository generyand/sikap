import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

// Get the app data path for storing the database
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.sqlite');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true, // Adds createdAt and updatedAt timestamps to every model
    underscored: true, // Use snake_case for fields in the database
  }
});

export default sequelize; 