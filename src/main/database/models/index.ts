import sequelize from '../config';
import Profile from './profile.model';
import Task from './task.model';

// Set up associations
Profile.hasMany(Task, {
  foreignKey: 'profileId',
  as: 'tasks',
  onDelete: 'CASCADE'
});

Task.belongsTo(Profile, {
  foreignKey: 'profileId',
  as: 'profile',
});

const models = {
  Profile,
  Task
};

export { sequelize, models };

export default models; 