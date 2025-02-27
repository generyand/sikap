import type { Task as PrismaTask } from '@prisma/client'

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

export interface Task extends PrismaTask {
  // Add any additional properties here if needed
} 