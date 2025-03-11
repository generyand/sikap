import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types'

export interface DashboardData {
  stats: {
    totalTasks: number;
    dueToday: number;
    highPriority: number;
    completedThisWeek: number;
    taskTrend: number;
  };
  charts: {
    statusData: { name: TaskStatus; value: number; }[];
    priorityData: { priority: TaskPriority; count: number; }[];
    categoryData: { name: TaskCategory; value: number; }[];
    completionTrend: { date: string; completed: number; created: number; }[];
  };
}

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
    api: {
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
    taskService: {
      getDashboardData: (profileId: string, timeframe: string) => Promise<{
        tasks: Task[];
        previousPeriodTaskCount: number;
      }>;
      createTask: (taskData: any) => Promise<Task>;
      updateTask: (taskId: string, taskData: any) => Promise<Task>;
      deleteTask: (taskId: string) => Promise<void>;
      getTasksByProfile: (profileId: string) => Promise<Task[]>;
    };
  }
}

export const window = globalThis.window 