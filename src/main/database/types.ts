// Enums
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

export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

// Profile type definition
export interface ProfileAttributes {
  id: string;
  name: string;
  avatar?: string | null;
  theme: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileCreationAttributes extends Omit<ProfileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Task type definition
export interface TaskAttributes {
  id: string;
  title: string;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  profileId: string;
  category?: TaskCategory | null;
  recurrence?: RecurrencePattern | null;
  notes?: string | null;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Omit<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {} 