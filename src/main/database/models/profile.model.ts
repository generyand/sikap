import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import { ProfileAttributes, ProfileCreationAttributes } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define the Profile model class
class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> {
  // Define association with Task model
  public static associate(models: any) {
    Profile.hasMany(models.Task, {
      foreignKey: 'profileId',
      as: 'tasks',
      onDelete: 'CASCADE'
    });
  }
}

// Initialize the model
Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100] // minimum 8 characters, maximum 100
      }
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
  },
  {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
    underscored: true, // Use snake_case for column names
  }
);

export default Profile; 