import { DatabaseService } from './database.service';
import { NotificationService } from './notification.service';
import { 
  TaskAttributes, 
  TaskStatus, 
  TaskPriority, 
  TaskCategory 
} from '../../shared/types';
import { RecurrencePattern } from '../database/types';
import { Op } from 'sequelize';

interface CreateTaskData {
  title: string;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  priority: TaskPriority;
  status?: TaskStatus;
  profileId: string;
  category?: TaskCategory | null;
  recurrence?: RecurrencePattern | null;
  notes?: string | null;
}

interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory | null;
  recurrence?: RecurrencePattern | null;
  notes?: string | null;
  completedAt?: Date | null;
  profileId?: string;
}

export class TaskService {
  private static instance: TaskService;
  private db: DatabaseService;
  private notificationService: NotificationService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async getTasksByProfile(profileId: string) {
    try {
      const tasks = await this.db.task.findAll({
        where: { profileId },
        include: [
          {
            model: this.db.profile,
            as: 'profile',
            attributes: ['id', 'name']
          }
        ]
      });
      
      return tasks.map(task => task.get({ plain: true }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getDashboardData(profileId: string, timeframe: string) {
    try {
      const now = new Date();
      let startDate = new Date();

      // Calculate start date based on timeframe
      switch (timeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to 7 days
      }

      // Fetch tasks within the timeframe
      const tasks = await this.db.task.findAll({
        where: {
          profileId,
          createdAt: {
            [Op.gte]: startDate
          }
        },
        include: [
          {
            model: this.db.profile,
            as: 'profile',
            attributes: ['id', 'name']
          }
        ]
      });

      // Get previous period tasks for trend calculation
      const previousPeriodStart = new Date(startDate);
      const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);

      const previousTasks = await this.db.task.findAll({
        where: {
          profileId,
          createdAt: {
            [Op.between]: [previousPeriodStart, startDate]
          }
        }
      });

      return {
        tasks: tasks.map(task => task.get({ plain: true })),
        previousPeriodTaskCount: previousTasks.length
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async createTask(taskData: CreateTaskData): Promise<TaskAttributes> {
    try {
      const task = await this.db.task.create({
        ...taskData,
        status: taskData.status || TaskStatus.TODO,
        completedAt: null
      });
      
      const createdTask = task.get({ plain: true });

      // Handle notifications for the new task
      if (taskData.dueDate) {
        await this.notificationService.createDueSoonNotification(createdTask);
      }

      if (taskData.recurrence) {
        await this.notificationService.createRecurringTaskNotification(createdTask);
      }
      
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskData: UpdateTaskData): Promise<TaskAttributes> {
    try {
      const { id, ...updateData } = taskData;
      
      if (!id) {
        throw new Error('Task ID is required for update');
      }
      
      // Get the original task before update
      const originalTask = await this.db.task.findByPk(id);
      if (!originalTask) {
        throw new Error(`Task with ID ${id} not found`);
      }
      const originalTaskData = originalTask.get({ plain: true });
      
      // Handle completedAt based on status
      let completedAt = updateData.completedAt;
      if (updateData.status === TaskStatus.COMPLETED && !completedAt) {
        completedAt = new Date();
      } else if (updateData.status && updateData.status !== TaskStatus.COMPLETED) {
        completedAt = null;
      }
      
      // Perform the update
      await this.db.task.update(
        {
          ...updateData,
          completedAt,
          updatedAt: new Date()
        },
        {
          where: { id }
        }
      );
      
      // Fetch the updated task
      const updatedTask = await this.db.task.findByPk(id);
      if (!updatedTask) {
        throw new Error(`Task with ID ${id} not found`);
      }

      const plainTask = updatedTask.get({ plain: true });

      // Handle notifications using the new approach
      await this.notificationService.handleTaskUpdate(originalTaskData, plainTask);
      
      return plainTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      if (!taskId) {
        throw new Error('Task ID is required for deletion');
      }
      
      await this.db.task.destroy({
        where: { id: taskId }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Add a custom reminder to a task
  async addTaskReminder(taskId: string, reminderDate: Date, message?: string): Promise<void> {
    try {
      const task = await this.db.task.findByPk(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      await this.notificationService.createCustomReminder(
        task.get({ plain: true }),
        reminderDate,
        message
      );
    } catch (error) {
      console.error('Error adding task reminder:', error);
      throw error;
    }
  }
} 