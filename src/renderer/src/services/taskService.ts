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
};

export const deleteTask = async (taskId: string): Promise<void> => {
  return taskAPI.deleteTask(taskId);
}; 