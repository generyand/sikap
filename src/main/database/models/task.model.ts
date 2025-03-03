import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { TaskAttributes, TaskCreationAttributes, TaskStatus, TaskPriority, TaskCategory, RecurrencePattern } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define the Task model class
class Task extends Model<TaskAttributes, TaskCreationAttributes> {
  // Define association with Profile model
  public static associate(models: any) {
    Task.belongsTo(models.Profile, {
      foreignKey: 'profileId',
      as: 'profile',
    });
  }
}

// Initialize the model
Task.init(
  {
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
      type: DataTypes.ENUM(...Object.values(TaskPriority)),
      allowNull: false,
      defaultValue: TaskPriority.MEDIUM,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
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
      type: DataTypes.ENUM(...Object.values(TaskCategory)),
      allowNull: true,
    },
    recurrence: {
      type: DataTypes.ENUM(...Object.values(RecurrencePattern)),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
    underscored: true, // Use snake_case for column names
  }
);

export default Task; 