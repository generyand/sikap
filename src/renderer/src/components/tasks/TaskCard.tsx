import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, Calendar, MoreVertical,
  Briefcase, User, ShoppingCart, Heart, 
  GraduationCap, Wallet, Home, FolderKanban
} from 'lucide-react'

// Import the color maps
import { categoryColorMap, priorityColorMap } from '@/lib/taskUtils'

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
}

export const TaskCard = React.memo(({ task, onSelect }: TaskCardProps) => {
  return (
    <div
      onClick={() => onSelect(task)}
      className={cn(
        "group bg-card/50 dark:bg-card/25 rounded-lg border hover:shadow-md transition-all",
        "hover:border-border/80 hover:bg-card cursor-pointer relative overflow-hidden",
        "flex flex-col min-h-[180px]",
        "shadow-sm hover:scale-[1.02]",
        task.status === TaskStatus.COMPLETED && "opacity-60"
      )}
    >
      {/* Left color strip */}
      <div className={cn(
        "absolute left-0 top-0 w-1.5 h-full rounded-l-lg",
        task.status === TaskStatus.TODO && "bg-yellow-500/80",
        task.status === TaskStatus.IN_PROGRESS && "bg-blue-500/80",
        task.status === TaskStatus.COMPLETED && "bg-green-500/80"
      )} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none rounded-lg" />

      <div className="p-4 flex flex-col h-full relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "text-xs font-medium shadow-sm",
                priorityColorMap[task.priority].badge
              )}
            >
              {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            </Badge>
            {task.dueDate && (
              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100 -mr-2 -mt-2 hover:bg-background/80"
            onClick={(e) => {
              e.stopPropagation()
              // Handle menu
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          <h3 className={cn(
            "font-medium mb-2 text-foreground/90",
            task.status === TaskStatus.COMPLETED && "line-through"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Footer section */}
        <div className="space-y-3">
          {/* Bottom metadata */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
            {/* Category */}
            <div className="flex items-center gap-2 min-w-0">
              {task.category && (
                <div className={cn(
                  "px-2 py-1 rounded-md border shadow-sm",
                  "flex items-center gap-1.5",
                  categoryColorMap[task.category].bg,
                  categoryColorMap[task.category].text,
                  categoryColorMap[task.category].border
                )}>
                  {React.createElement(categoryColorMap[task.category].icon, { className: "h-3.5 w-3.5" })}
                  <span className="truncate">
                    {task.category.charAt(0) + task.category.slice(1).toLowerCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Date/Time */}
            <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md ml-2 shrink-0">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, h:mm a') : 'No date'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TaskCard.displayName = 'TaskCard' 