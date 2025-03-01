import React, { useState } from 'react'
import { Task, TaskStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import { 
  DndContext, 
  DragOverlay,
  useDraggable,
  useDroppable,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core'
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/sortable'

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [clonedTasks, setClonedTasks] = useState<Task[]>(tasks);

  // Update cloned tasks when tasks prop changes
  React.useEffect(() => {
    setClonedTasks(tasks);
  }, [tasks]);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      [TaskStatus.TODO]: [] as Task[],
      [TaskStatus.IN_PROGRESS]: [] as Task[],
      [TaskStatus.COMPLETED]: [] as Task[],
      [TaskStatus.ARCHIVED]: [] as Task[]
    };
    
    clonedTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [clonedTasks]);
  
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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event);
    const { active } = event;
    const taskId = active.id as string;
    const task = clonedTasks.find(t => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    console.log('Drag over:', event);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragging over a column
    if (overId in TaskStatus) {
      const activeTask = clonedTasks.find(t => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        setClonedTasks(prev => 
          prev.map(task => 
            task.id === activeId 
              ? { ...task, status: overId as TaskStatus } 
              : task
          )
        );
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag end:', event);
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('Active ID:', activeId);
    console.log('Over ID:', overId);
    console.log('TaskStatus values:', Object.values(TaskStatus));
    
    // Check if overId is a valid TaskStatus
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      console.log(`Moving task ${activeId} to ${overId}`);
      
      // Update local state immediately
      setClonedTasks(prev => 
        prev.map(task => 
          task.id === activeId 
            ? { ...task, status: overId as TaskStatus } 
            : task
        )
      );
      
      console.log('About to call onStatusChange with:', activeId, overId);
      const statusToUpdate = overId as TaskStatus;
      console.log('Status type:', typeof statusToUpdate);
      console.log('Status value:', statusToUpdate);
      
      onStatusChange(activeId, statusToUpdate);
    } else {
      console.log('Invalid drop target:', overId);
    }

    setActiveTask(null);
  };

  // At the top of your component
  const todoDroppable = useDroppable({ id: TaskStatus.TODO });
  const inProgressDroppable = useDroppable({ id: TaskStatus.IN_PROGRESS });
  const completedDroppable = useDroppable({ id: TaskStatus.COMPLETED });
  const archivedDroppable = useDroppable({ id: TaskStatus.ARCHIVED });

  // Add this at the top of your component
  console.log('TaskStatus enum:', TaskStatus);
  console.log('TaskStatus.TODO:', TaskStatus.TODO);
  console.log('TaskStatus.IN_PROGRESS:', TaskStatus.IN_PROGRESS);
  console.log('TaskStatus.COMPLETED:', TaskStatus.COMPLETED);
  console.log('TaskStatus.ARCHIVED:', TaskStatus.ARCHIVED);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)] pb-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
          const { setNodeRef, isOver } = useDroppable({
            id: status
          });
          
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
                ref={setNodeRef}
                className={cn(
                  "bg-muted/30 rounded-lg p-2 flex-1 overflow-y-auto custom-scrollbar space-y-3",
                  isOver && "ring-2 ring-primary/50"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  console.log('Drag over DOM event');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('taskId');
                  console.log('Drop DOM event, taskId:', taskId);
                  if (taskId) {
                    onStatusChange(taskId, status as TaskStatus);
                  }
                }}
              >
                {statusTasks.map(task => (
                  <div key={task.id} className="touch-none">
                    <TaskCard 
                      task={task}
                      onSelect={onSelectTask}
                      onEdit={onEditTask}
                      onStatusChange={(task, newStatus) => onStatusChange(task.id, newStatus)}
                      onDelete={onDeleteTask}
                      isDraggable={true}
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

      <DragOverlay>
        {activeTask && (
          <TaskCard 
            task={activeTask}
            onSelect={() => {}}
            onEdit={() => {}}
            onStatusChange={() => {}}
            onDelete={() => {}}
          />
        )}
      </DragOverlay>

      <div className="p-4">
        <h3>Debug Controls</h3>
        {tasks.length > 0 && (
          <div className="flex gap-2 mt-2">
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                const taskId = tasks[0].id;
                console.log('Testing status update with task:', taskId);
                onStatusChange(taskId, TaskStatus.IN_PROGRESS);
              }}
            >
              Test Update Status
            </button>
          </div>
        )}
      </div>
    </DndContext>
  );
}; 