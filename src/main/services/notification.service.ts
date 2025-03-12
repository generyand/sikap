import { DatabaseService } from './database.service';
import { NotificationType } from '../database/models/notification.model';
import { TaskAttributes, TaskStatus, NotificationAttributes } from '../../shared/types';
import { differenceInHours, isAfter } from 'date-fns';
import { Op } from 'sequelize';

export class NotificationService {
  private static instance: NotificationService;
  private db: DatabaseService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Start notification checking service
  startNotificationChecker() {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkAndTriggerNotifications();
    }, 60000);
  }

  // Stop notification checking service
  stopNotificationChecker() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check for notifications that need to be triggered
  private async checkAndTriggerNotifications() {
    try {
      const now = new Date();
      const notifications = await this.db.notification.findAll({
        where: {
          read: false,
          scheduledFor: {
            [Op.lte]: now
          }
        },
        include: [{
          model: this.db.task,
          as: 'task'
        }]
      });

      for (const notification of notifications) {
        const notificationData = notification.get({ plain: true });
        this.triggerSystemNotification(notificationData.title, notificationData.message);
        
        // Mark as read after triggering
        await notification.update({ read: true });
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  // Create notification for task due soon
  async createDueSoonNotification(task: TaskAttributes) {
    if (!task.dueDate) return;

    const hoursUntilDue = differenceInHours(new Date(task.dueDate), new Date());
    
    // Create notification if task is due within 24 hours
    if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
      await this.db.notification.create({
        type: NotificationType.TASK_DUE_SOON,
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due in ${hoursUntilDue} hours`,
        taskId: task.id,
        profileId: task.profileId,
        read: false,
        scheduledFor: new Date() // Notify immediately
      });
    }
  }

  // Create notification for overdue task
  async createOverdueNotification(task: TaskAttributes) {
    if (!task.dueDate) return;

    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (isAfter(now, dueDate) && task.status !== TaskStatus.COMPLETED) {
      await this.db.notification.create({
        type: NotificationType.TASK_OVERDUE,
        title: 'Task Overdue',
        message: `Task "${task.title}" is overdue`,
        taskId: task.id,
        profileId: task.profileId,
        read: false,
        scheduledFor: new Date() // Notify immediately
      });
    }
  }

  // Create notification for recurring task
  async createRecurringTaskNotification(task: TaskAttributes) {
    if (!task.recurrence) return;

    await this.db.notification.create({
      type: NotificationType.RECURRING_TASK,
      title: 'Recurring Task Due',
      message: `Recurring task "${task.title}" needs attention`,
      taskId: task.id,
      profileId: task.profileId,
      read: false,
      scheduledFor: new Date() // You might want to adjust this based on recurrence pattern
    });
  }

  // Create a custom reminder
  async createCustomReminder(task: TaskAttributes, reminderDate: Date, message?: string) {
    await this.db.notification.create({
      type: NotificationType.TASK_REMINDER,
      title: 'Task Reminder',
      message: message || `Reminder for task "${task.title}"`,
      taskId: task.id,
      profileId: task.profileId,
      read: false,
      scheduledFor: reminderDate
    });
  }

  private triggerSystemNotification(title: string, message: string) {
    // Implement system notification using Electron's Notification API
    // This will be implemented based on your UI requirements
    if (process.env.NODE_ENV !== 'test') {
      new Notification(title, {
        body: message,
        silent: false
      });
    }
  }

  // Get all unread notifications
  async getUnreadNotifications(profileId: string): Promise<NotificationAttributes[]> {
    try {
      const notifications = await this.db.notification.findAll({
        where: { 
          read: false,
          profileId 
        },
        include: [{
          model: this.db.task,
          as: 'task'
        }],
        order: [['scheduledFor', 'DESC']]
      });
      return notifications.map(n => n.get({ plain: true }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  // Get all notifications
  async getAllNotifications(profileId: string): Promise<NotificationAttributes[]> {
    try {
      const notifications = await this.db.notification.findAll({
        where: { profileId },
        include: [{
          model: this.db.task,
          as: 'task'
        }],
        order: [['scheduledFor', 'DESC']]
      });
      return notifications.map(n => n.get({ plain: true }));
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  // Mark a notification as read
  async markAsRead(notificationId: string) {
    try {
      await this.db.notification.update(
        { read: true },
        { where: { id: notificationId } }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Remove notifications for a task
  async removeTaskNotifications(taskId: string, types?: NotificationType[]) {
    try {
      const whereClause: any = { taskId };
      if (types && types.length > 0) {
        whereClause.type = types;
      }
      
      await this.db.notification.destroy({
        where: whereClause
      });
    } catch (error) {
      console.error('Error removing task notifications:', error);
      throw error;
    }
  }

  // Handle notifications for task updates
  async handleTaskUpdate(oldTask: TaskAttributes, newTask: TaskAttributes) {
    try {
      // Handle status change to completed
      if (newTask.status === TaskStatus.COMPLETED) {
        // Remove all pending notifications for completed tasks
        await this.removeTaskNotifications(newTask.id);
        return;
      }

      // Handle due date changes
      if (oldTask.dueDate !== newTask.dueDate) {
        // Remove existing due date related notifications
        await this.removeTaskNotifications(newTask.id, [
          NotificationType.TASK_DUE_SOON,
          NotificationType.TASK_OVERDUE
        ]);

        // Create new notifications if there's a due date
        if (newTask.dueDate) {
          const hoursUntilDue = differenceInHours(new Date(newTask.dueDate), new Date());
          
          // Create due soon notification if within 24 hours
          if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
            await this.createDueSoonNotification(newTask);
          }
          
          // Create overdue notification if past due
          if (hoursUntilDue < 0 && (newTask.status === TaskStatus.TODO || newTask.status === TaskStatus.IN_PROGRESS)) {
            await this.createOverdueNotification(newTask);
          }
        }
      }

      // Handle recurrence changes
      if (oldTask.recurrence !== newTask.recurrence) {
        // Remove existing recurring notifications
        await this.removeTaskNotifications(newTask.id, [NotificationType.RECURRING_TASK]);
        
        // Create new recurring notification if recurrence is set
        if (newTask.recurrence) {
          await this.createRecurringTaskNotification(newTask);
        }
      }
    } catch (error) {
      console.error('Error handling task update notifications:', error);
      throw error;
    }
  }
} 