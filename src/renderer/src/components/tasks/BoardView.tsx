import React from 'react'
import { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'

interface BoardViewProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onStatusChange,
  onDeleteTask
}) => {
  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      [TaskStatus.TODO]: [] as Task[],
      [TaskStatus.IN_PROGRESS]: [] as Task[],
      [TaskStatus.COMPLETED]: [] as Task[],
      [TaskStatus.ARCHIVED]: [] as Task[]
    };
    
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);
  
  // Get status display name
  const getStatusDisplayName = (status: TaskStatus) => {
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
  };
  
  // Get status color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-yellow-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case TaskStatus.COMPLETED:
        return 'bg-green-500';
      case TaskStatus.ARCHIVED:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] pb-4">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
        return (
          <div key={status} className="flex flex-col h-full">
            <div className="mb-3 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", getStatusColor(status as TaskStatus))} />
                  <h2 className="text-base font-semibold tracking-tight">
                    {getStatusDisplayName(status as TaskStatus)}
                  </h2>
                </div>
                <span className="text-sm font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-md">
                  {statusTasks.length}
                </span>
              </div>
            </div>
            
            <div 
              className="bg-muted/30 rounded-lg p-2 flex-1 overflow-y-auto custom-scrollbar space-y-3"
            >
              {statusTasks.map(task => (
                <div key={task.id}>
                  <TaskCard 
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                    onDelete={onDeleteTask}
                  />
                </div>
              ))}
              
              {statusTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 border border-dashed rounded-lg border-muted-foreground/20 text-muted-foreground text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 