// This script initializes the database with Sequelize
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Try to get the user data directory for Electron
let userDataPath;
try {
  // If running in Electron context
  const electron = require('electron');
  const app = electron.app || (electron.remote && electron.remote.app);
  
  if (app) {
    userDataPath = app.getPath('userData');
    console.log(`Using Electron userData path: ${userDataPath}`);
  } else {
    throw new Error('Not in Electron context');
  }
} catch (error) {
  // If running from CLI (not in Electron), use a similar path manually
  const appName = require('../package.json').name;
  
  if (process.platform === 'win32') {
    userDataPath = path.join(process.env.APPDATA, appName);
  } else if (process.platform === 'darwin') {
    userDataPath = path.join(process.env.HOME, 'Library', 'Application Support', appName);
  } else {
    userDataPath = path.join(process.env.HOME, '.config', appName);
  }
  console.log(`Running outside of Electron, using path: ${userDataPath}`);
}

// Create the directory if it doesn't exist
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
  console.log(`Created directory: ${userDataPath}`);
}

const dbPath = path.join(userDataPath, 'database.sqlite');
console.log(`Initializing database at: ${dbPath}`);

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

// Define models
function defineModels() {
  const { DataTypes } = Sequelize;
  const { v4: uuidv4 } = require('uuid');
  
  // Create Profile model
  const Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'light',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'profiles',
    underscored: true,
  });
  
  // Define Task statuses and priorities as JavaScript objects (not real enums)
  const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ARCHIVED: 'ARCHIVED'
  };
  
  const TaskPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
  };
  
  const TaskCategory = {
    WORK: 'WORK',
    PERSONAL: 'PERSONAL',
    SHOPPING: 'SHOPPING',
    HEALTH: 'HEALTH',
    EDUCATION: 'EDUCATION',
    FINANCE: 'FINANCE',
    HOME: 'HOME',
    OTHER: 'OTHER'
  };
  
  const RecurrencePattern = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
    CUSTOM: 'CUSTOM'
  };
  
  // Create Task model
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: TaskPriority.MEDIUM,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: TaskStatus.TODO,
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    recurrence: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'tasks',
    underscored: true,
  });

  // Define notification types
  const NotificationType = {
    TASK_CREATED: 'TASK_CREATED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_COMPLETED: 'TASK_COMPLETED',
    TASK_DUE_SOON: 'TASK_DUE_SOON',
    TASK_OVERDUE: 'TASK_OVERDUE',
    TASK_REMINDER: 'TASK_REMINDER',
    TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED'
  };

  // Create Notification model
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(NotificationType)]
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id',
      }
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'notifications',
    underscored: true,
  });
  
  // Set up associations
  Profile.hasMany(Task, { foreignKey: 'profileId', as: 'tasks', onDelete: 'CASCADE' });
  Task.belongsTo(Profile, { foreignKey: 'profileId', as: 'profile' });

  // Notification associations
  Profile.hasMany(Notification, { foreignKey: 'profileId', as: 'notifications', onDelete: 'CASCADE' });
  Task.hasMany(Notification, { foreignKey: 'taskId', as: 'notifications', onDelete: 'CASCADE' });
  Notification.belongsTo(Profile, { foreignKey: 'profileId', as: 'profile' });
  Notification.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
  
  return { Profile, Task, Notification };
}

// Create sample data
async function createSampleData(models) {
  const { Profile, Task, Notification } = models;
  
  // Create a default profile with password
  const profile = await Profile.create({
    name: 'Default User',
    password: 'DefaultPass123', // This is just for development
    theme: 'light'
  });
  
  console.log(`Created profile: ${profile.id}`);
  
  // Create some sample tasks
  const tasks = await Task.bulkCreate([
    {
      title: 'Welcome to SIKAP',
      description: 'This is a sample task to help you get started.',
      priority: 'MEDIUM',
      status: 'TODO',
      profileId: profile.id,
      category: 'OTHER'
    },
    {
      title: 'Create your first task',
      description: 'Click the + button to create a new task.',
      priority: 'HIGH',
      status: 'TODO',
      profileId: profile.id,
      category: 'WORK',
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    }
  ]);

  // Create sample notifications
  await Notification.bulkCreate([
    {
      type: 'TASK_DUE_SOON',
      title: 'Task Due Tomorrow',
      message: 'The task "Create your first task" is due tomorrow',
      read: false,
      taskId: tasks[1].id,
      profileId: profile.id,
      scheduledFor: new Date(Date.now() + 43200000) // 12 hours from now
    },
    {
      type: 'TASK_REMINDER',
      title: 'Daily Planning Reminder',
      message: 'Time to review your tasks for today',
      read: false,
      taskId: tasks[0].id,
      profileId: profile.id,
      scheduledFor: new Date(new Date().setHours(9, 0, 0, 0)) // Today at 9 AM
    }
  ]);
  
  console.log(`Created ${tasks.length} sample tasks and notifications`);
}

async function init() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Define models
    const models = defineModels();
    
    // Sync all models with force option to create tables
    // Note: This will DROP existing tables in development
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
    
    // Create sample data
    await createSampleData(models);
    
    console.log('Database has been initialized successfully with sample data.');
    
    await sequelize.close();
  } catch (error) {
    console.error('Unable to initialize the database:', error);
  }
}

init(); 