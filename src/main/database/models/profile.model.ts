import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config';
import { ProfileAttributes, ProfileCreationAttributes } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define the Profile model class
class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  public id!: string;
  public name!: string;
  public avatar!: string | null;
  public theme!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
  }
);

export default Profile; 