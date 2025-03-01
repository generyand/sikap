import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Task, TaskStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, Calendar, MoreVertical,
  CheckCircle2, Pencil, Trash2, 
  ArrowRightCircle, ArchiveIcon,
  StickyNote, CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { categoryColorMap, priorityColorMap } from '@/lib/taskUtils'

interface TaskListItemProps {
  task: Task
  onSelect: (task: Task) => void
  onEdit?: (task: Task) => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
  onDelete?: (taskId: string) => void
}

export const TaskListItem = React.memo(({ 
  task, 
  onSelect, 
  onEdit,
  onStatusChange,
  onDelete
}: TaskListItemProps) => {
  return (
    <div
      onClick={() => onSelect(task)}
      className={cn(
        "group border-b last:border-b-0 py-3 px-4 hover:bg-muted/50 transition-colors cursor-pointer",
        "flex items-center gap-3 w-full",
        task.status === TaskStatus.COMPLETED && "bg-muted/20"
      )}
    >
      {/* Status indicator/checkbox - ensure exact width matches header */}
      <div className="shrink-0 w-6 flex justify-center">
        {task.status === TaskStatus.COMPLETED ? (
          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
          </div>
        ) : (
          <div 
            className={cn(
              "w-6 h-6 rounded-full border-2 hover:bg-muted transition-colors",
              task.status === TaskStatus.TODO && "border-yellow-500",
              task.status === TaskStatus.IN_PROGRESS && "border-blue-500",
              task.status === TaskStatus.ARCHIVED && "border-gray-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (task.status !== TaskStatus.COMPLETED) {
                onStatusChange?.(task, TaskStatus.COMPLETED);
              }
            }}
          />
        )}
      </div>

      {/* Task main info - add pl-3 to match header padding */}
      <div className="flex-1 min-w-0 pl-3">
        <div className="flex items-start gap-2">
          <h3 className={cn(
            "font-medium text-foreground/90 truncate",
            task.status === TaskStatus.COMPLETED && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          
          {/* Priority badge - only show for HIGH and URGENT */}
          {(task.priority === 'HIGH' || task.priority === 'URGENT') && (
            <Badge 
              className={cn(
                "text-xs font-medium shadow-sm shrink-0",
                priorityColorMap[task.priority].badge
              )}
            >
              {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Category - ensure width matches header */}
      {task.category ? (
        <div className="hidden sm:flex items-center justify-center w-[120px]">
          <div className={cn(
            "px-2 py-1 rounded-md border shadow-sm",
            "flex items-center gap-1.5",
            categoryColorMap[task.category].bg,
            categoryColorMap[task.category].text,
            categoryColorMap[task.category].border
          )}>
            {React.createElement(categoryColorMap[task.category].icon, { className: "h-3.5 w-3.5 shrink-0" })}
            <span className="truncate max-w-[80px]">
              {task.category.charAt(0) + task.category.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block w-[120px]"></div>
      )}

      {/* Due date - ensure width matches header */}
      <div className="hidden md:flex items-center justify-center w-[140px] shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {task.dueDate ? (
            <span>{format(new Date(task.dueDate), 'MMM d, h:mm a')}</span>
          ) : (
            <span>No due date</span>
          )}
        </div>
      </div>

      {/* Status - ensure width matches header */}
      <div className="hidden lg:flex items-center justify-center w-[100px] shrink-0">
        <div className={cn(
          "px-2 py-1 rounded-md text-xs",
          task.status === TaskStatus.TODO && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          task.status === TaskStatus.IN_PROGRESS && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          task.status === TaskStatus.COMPLETED && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          task.status === TaskStatus.ARCHIVED && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
        )}>
          {getStatusDisplayName(task.status)}
        </div>
      </div>
      
      {/* Actions - ensure exact width matches header */}
      <div className="shrink-0 w-8 flex justify-center mr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {/* Status actions */}
            {task.status !== TaskStatus.COMPLETED && (
              <DropdownMenuItem 
                className="text-green-600 dark:text-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task, TaskStatus.COMPLETED);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </DropdownMenuItem>
            )}
            
            {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.COMPLETED && (
              <DropdownMenuItem 
                className="text-blue-600 dark:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task, TaskStatus.IN_PROGRESS);
                }}
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Mark as In Progress
              </DropdownMenuItem>
            )}
            
            {task.status === TaskStatus.COMPLETED && (
              <DropdownMenuItem 
                className="text-yellow-600 dark:text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task, TaskStatus.TODO);
                }}
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Mark as Todo
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {/* Edit option */}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) {
                  onEdit(task);
                } else {
                  onSelect(task);
                }
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Task
            </DropdownMenuItem>
            
            {/* Archive option */}
            {task.status !== TaskStatus.ARCHIVED && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(task, TaskStatus.ARCHIVED);
                }}
              >
                <ArchiveIcon className="h-4 w-4 mr-2" />
                Archive Task
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {/* Delete option */}
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
});

// Helper function to get display name for status
function getStatusDisplayName(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO:
      return 'To Do';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
    case TaskStatus.ARCHIVED:
      return 'Archived';
    default:
      return status;
  }
}

TaskListItem.displayName = 'TaskListItem' 