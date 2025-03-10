// Re-exporting types and enums to replace Prisma imports
import type { NewTask } from './task';

export type { NewTask };

// Task Status enum
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

// Task Priority enum
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Task Category enum
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

// Recurrence Pattern enum
export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

// Profile interface
export interface Profile {
  id: string;
  name: string;
  password: string;
  avatar?: string | null;
  theme: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Task interface
export interface Task {
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