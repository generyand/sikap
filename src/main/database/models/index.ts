import sequelize from '../config';
import Profile from './profile.model';
import Task from './task.model';
import Notification from './notification.model';

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

// Notification associations
Profile.hasMany(Notification, {
  foreignKey: 'profileId',
  as: 'notifications',
  onDelete: 'CASCADE'
});

Task.hasMany(Notification, {
  foreignKey: 'taskId',
  as: 'notifications',
  onDelete: 'CASCADE'
});

Notification.belongsTo(Profile, {
  foreignKey: 'profileId',
  as: 'profile'
});

Notification.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task'
});

const models = {
  Profile,
  Task,
  Notification
};

export { sequelize, models };

export default models; 