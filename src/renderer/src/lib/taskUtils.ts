import { TaskPriority, TaskCategory } from '@/types'
import { 
  Briefcase, User, ShoppingCart, Heart, 
  GraduationCap, Wallet, Home, FolderKanban
} from 'lucide-react'
import React from 'react'

export const categoryColorMap: Record<TaskCategory, { 
  bg: string, 
  text: string, 
  border: string,
  icon: React.ComponentType<{ className?: string }> 
}> = {
  WORK: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: Briefcase
  },
  PERSONAL: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    icon: User
  },
  SHOPPING: {
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    icon: ShoppingCart
  },
  HEALTH: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    icon: Heart
  },
  EDUCATION: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: GraduationCap
  },
  FINANCE: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Wallet
  },
  HOME: {
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    icon: Home
  },
  OTHER: {
    bg: "bg-gray-50 dark:bg-gray-950",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    icon: FolderKanban
  }
}

export const priorityColorMap: Record<TaskPriority, {
  bg: string,
  text: string,
  border: string,
  badge: string
}> = {
  URGENT: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
    badge: "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
  },
  HIGH: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600"
  },
  MEDIUM: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    badge: "bg-primary hover:bg-primary/90 text-primary-foreground"
  },
  LOW: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-muted",
    badge: "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
  }
} 