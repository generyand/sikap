import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { v4 as uuidv4 } from 'uuid';

// Define notification types
export enum NotificationType {
  TASK_DUE_SOON = 'TASK_DUE_SOON',    // For tasks due in the next 24 hours
  TASK_OVERDUE = 'TASK_OVERDUE',       // For tasks that are past their due date
  TASK_REMINDER = 'TASK_REMINDER',     // For custom reminders set by the user
  RECURRING_TASK = 'RECURRING_TASK'    // For recurring tasks that need attention
}

// Define the Notification attributes interface
interface NotificationAttributes {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  taskId: string;           // Reference to the related task
  profileId: string;        // Reference to the profile
  scheduledFor: Date;       // When the notification should be shown
  createdAt: Date;
  updatedAt: Date;
}

// Define the creation attributes interface
interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Define the Notification model class
class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> {
  // Define associations with Task and Profile models
  public static associate(models: any) {
    Notification.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task',
      onDelete: 'CASCADE'
    });
    
    Notification.belongsTo(models.Profile, {
      foreignKey: 'profileId',
      as: 'profile',
      onDelete: 'CASCADE'
    });
  }
}

// Initialize the model
Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
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
      allowNull: false, // Changed to false since all notifications should be task-related
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
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    underscored: true, // Use snake_case for column names
  }
);

export default Notification; 