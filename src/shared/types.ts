export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskCategory {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  SHOPPING = 'SHOPPING',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  FINANCE = 'FINANCE',
  HOME = 'HOME',
  OTHER = 'OTHER'
}

export interface TaskAttributes {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory | null;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  profileId: string;
  recurrence?: string | null;
  profile?: {
    id: string;
    name: string;
  };
}

export interface NotificationAttributes {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  taskId?: string;
  profileId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  task?: TaskAttributes;
  profile?: {
    id: string;
    name: string;
  };
} 