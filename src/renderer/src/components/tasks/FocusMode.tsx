import React from 'react'
import { Task, TaskStatus, TaskPriority } from '@prisma/client'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface FocusModeProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
  focusDate: Date
  onDateChange: (date: Date) => void
}

export const FocusMode: React.FC<FocusModeProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onStatusChange,
  onDeleteTask,
  focusDate,
  onDateChange
}) => {
  // Filter tasks for focus mode
  const focusTasks = React.useMemo(() => {
    // Get high priority tasks
    const highPriorityTasks = tasks.filter(task => 
      task.priority === TaskPriority.HIGH && 
      task.status !== TaskStatus.COMPLETED &&
      task.status !== TaskStatus.ARCHIVED
    );
    
    // Get tasks due today
    const dueTodayTasks = tasks.filter(task => 
      task.dueDate && 
      isToday(new Date(task.dueDate)) &&
      task.status !== TaskStatus.COMPLETED &&
      task.status !== TaskStatus.ARCHIVED &&
      task.priority !== TaskPriority.HIGH // Avoid duplicates
    );
    
    // Get overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() &&
      !isToday(new Date(task.dueDate)) &&
      task.status !== TaskStatus.COMPLETED &&
      task.status !== TaskStatus.ARCHIVED
    );
    
    // Get in-progress tasks
    const inProgressTasks = tasks.filter(task => 
      task.status === TaskStatus.IN_PROGRESS &&
      !highPriorityTasks.includes(task) &&
      !dueTodayTasks.includes(task) &&
      !overdueTasks.includes(task)
    );
    
    return {
      highPriority: highPriorityTasks,
      dueToday: dueTodayTasks,
      overdue: overdueTasks,
      inProgress: inProgressTasks
    };
  }, [tasks]);
  
  const hasFocusTasks = 
    focusTasks.highPriority.length > 0 || 
    focusTasks.dueToday.length > 0 || 
    focusTasks.overdue.length > 0 || 
    focusTasks.inProgress.length > 0;
  
  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Focus Mode</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDateChange(new Date())}
            className={cn(isToday(focusDate) && "bg-primary/10")}
          >
            Today
          </Button>
        </div>
      </div>
      
      {hasFocusTasks ? (
        <>
          {/* Overdue Tasks */}
          {focusTasks.overdue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-destructive flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                Overdue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusTasks.overdue.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* High Priority Tasks */}
          {focusTasks.highPriority.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                High Priority
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusTasks.highPriority.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Due Today Tasks */}
          {focusTasks.dueToday.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Due Today
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusTasks.dueToday.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* In Progress Tasks */}
          {focusTasks.inProgress.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                In Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusTasks.inProgress.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Focus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">All caught up!</h3>
          <p className="text-muted-foreground max-w-md">
            You don't have any high priority or due tasks for today. Enjoy your day!
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => setIsAddTaskOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a new task
          </Button>
        </div>
      )}
    </div>
  );
}; 