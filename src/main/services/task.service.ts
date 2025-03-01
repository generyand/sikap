import { DatabaseService } from './database.service';
import { 
  TaskAttributes, 
  TaskStatus, 
  TaskPriority, 
  TaskCategory, 
  RecurrencePattern 
} from '../database/types';

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

  private constructor() {
    this.db = DatabaseService.getInstance();
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

  async createTask(taskData: CreateTaskData): Promise<TaskAttributes> {
    try {
      const task = await this.db.task.create({
        ...taskData,
        status: taskData.status || TaskStatus.TODO,
        completedAt: null
      });
      
      return task.get({ plain: true });
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
      
      return updatedTask.get({ plain: true });
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
} 