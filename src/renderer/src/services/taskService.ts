import { TaskPriority, TaskStatus, TaskCategory, RecurrencePattern, Task } from '@/types'
import { taskAPI } from '../../../preload/api/task.api'

interface CreateTaskDTO {
  title: string
  description: string | null
  startDate?: Date | null
  dueDate?: Date | null
  priority: TaskPriority
  status?: TaskStatus
  profileId: string
  category?: TaskCategory | null
  reminder?: Date | null
  recurrence?: RecurrencePattern | null
  notes?: string | null
}

// Individual exports for backward compatibility
export const fetchTasks = async (profileId: string | null): Promise<Task[]> => {
  if (!profileId) return []
  return taskAPI.getTasks(profileId)
}

export const createTask = async (taskData: CreateTaskDTO): Promise<Task> => {
  return taskAPI.createTask({
    ...taskData,
    status: taskData.status ?? TaskStatus.TODO
  })
}

export const updateTask = async (taskData: Partial<Task> & { id: string }) => {
  console.log('updateTask service called with:', taskData);
  try {
    const result = await taskAPI.updateTask(taskData);
    console.log('updateTask service result:', result);
    return result;
  } catch (error) {
    console.error('Error in updateTask service:', error);
    throw error;
  }
}

export const deleteTask = async (taskId: string): Promise<void> => {
  return taskAPI.deleteTask(taskId);
}

export const getDashboardData = async (profileId: string, timeframe: string) => {
  try {
    // Get current tasks
    const tasks = await fetchTasks(profileId);
    console.log('Fetched tasks:', tasks);
    
    // Get start date based on timeframe
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to 7 days
    }

    console.log('Filtering tasks from date:', startDate);

    // Filter tasks for current period - include all tasks if timeframe is not 'today'
    const currentPeriodTasks = timeframe === 'today'
      ? tasks.filter(task => {
          const createdAt = task.createdAt ? new Date(task.createdAt) : null;
          return createdAt && createdAt >= startDate;
        })
      : tasks;

    console.log('Filtered current period tasks:', currentPeriodTasks);

    // Get previous period tasks count for trend calculation
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(startDate.getDate() - (timeframe === 'today' ? 1 : parseInt(timeframe.replace('days', ''))));
    
    const previousPeriodTasks = tasks.filter(task => {
      const createdAt = task.createdAt ? new Date(task.createdAt) : null;
      return createdAt && createdAt >= previousPeriodStart && createdAt < startDate;
    });

    console.log('Previous period tasks:', previousPeriodTasks);

    return {
      tasks: currentPeriodTasks,
      previousPeriodTaskCount: previousPeriodTasks.length
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return empty data instead of throwing
    return {
      tasks: [],
      previousPeriodTaskCount: 0
    };
  }
}

// Service object export
export const taskService = {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardData
} 