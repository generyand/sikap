import React from 'react'
import { Task, TaskStatus } from '@prisma/client'
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

  // Test function for manual status changes
  const testStatusChange = React.useCallback(() => {
    if (tasks.length > 0) {
      const testTask = tasks[0];
      const currentStatus = testTask.status;
      const newStatus = currentStatus === TaskStatus.TODO ? 
        TaskStatus.IN_PROGRESS : 
        currentStatus === TaskStatus.IN_PROGRESS ? 
          TaskStatus.COMPLETED : 
          TaskStatus.TODO;
      
      onStatusChange(testTask.id, newStatus);
    }
  }, [tasks, onStatusChange]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] pb-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
          return (
            <div key={status} className="flex flex-col h-full">
              <div className="mb-3 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
                <h2 className="text-sm font-medium flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", getStatusColor(status as TaskStatus))} />
                  {getStatusDisplayName(status as TaskStatus)}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({statusTasks.length})
                  </span>
                </h2>
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

      <div className="p-4">
        <h3>Status Change Test</h3>
        {tasks.length > 0 && (
          <div className="flex gap-2 mt-2">
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={testStatusChange}
            >
              Test Status Change
            </button>
          </div>
        )}
      </div>
    </>
  );
}; 