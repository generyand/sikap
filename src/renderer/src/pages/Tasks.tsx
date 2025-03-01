import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import { 
  Plus, Search, List, LayoutGrid,
  Focus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
} from '@/components/ui/sheet'
import { 
  ToggleGroup,
  ToggleGroupItem 
} from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'

import type { Task } from '@prisma/client'
import { TaskPriority, TaskStatus, NewTask } from '../types/task'
import React from 'react'
import { isSameDay } from 'date-fns'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Import our extracted components
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { BoardView } from '@/components/tasks/BoardView'
import { FocusMode } from '@/components/tasks/FocusMode'
import { TaskListItem } from '@/components/tasks/TaskListItem'

export const Tasks = () => {
  const { profileId } = useProfile()
  const queryClient = useQueryClient()
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: null,
    startDate: null,
    dueDate: null,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    category: null,
    recurrence: null,
    notes: null,
    profileId: profileId || ''
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [isEditing, setIsEditing] = useState(false)
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'focus'>('list')
  const [focusDate, setFocusDate] = useState<Date>(new Date())

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
    enabled: !!profileId
  })

  const groupedTasks = React.useMemo(() => {
    if (!tasks) return { today: [], tomorrow: [], upcoming: [] }
    
    const filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'ALL' || task.status === statusFilter)
    )
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return filtered.reduce((acc, task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null
      
      if (!dueDate) {
        acc.upcoming.push(task)
      } else if (isSameDay(dueDate, today)) {
        acc.today.push(task)
      } else if (isSameDay(dueDate, tomorrow)) {
        acc.tomorrow.push(task)
      } else {
        acc.upcoming.push(task)
      }
      
      return acc
    }, { today: [], tomorrow: [], upcoming: [] } as Record<string, Task[]>)
  }, [tasks, searchTerm, statusFilter])

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] })
      setIsAddTaskOpen(false)
      resetNewTaskForm()
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (data) => {
      console.log('Task updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] });
      setSelectedTask(null);
      setEditTask(null);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating task:', error);
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] })
      setSelectedTask(null)
      setTaskToDelete(null)
    }
  })

  const handleAddTask = useCallback(() => {
    if (!profileId || !newTask.title.trim()) return
    
    createTaskMutation.mutate({
      ...newTask,
      profileId
    })
  }, [newTask, profileId, createTaskMutation])

  const resetNewTaskForm = useCallback(() => {
      setNewTask({
        title: '',
        description: null,
        startDate: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        category: null,
        recurrence: null,
      notes: null,
      profileId: profileId || ''
    })
  }, [profileId])

  const handleSelectTask = useCallback((task: Task) => {
    setSelectedTask(task)
    setEditTask(null)
    setIsEditing(false)
  }, [])

  const handleEditTask = useCallback(() => {
    if (!selectedTask) return
    setEditTask({...selectedTask})
    setIsEditing(true)
  }, [selectedTask])

  const handleCancelEdit = useCallback(() => {
    setEditTask(null)
    setIsEditing(false)
  }, [])

  const handleSaveTask = useCallback(() => {
    if (!editTask || !editTask.id) return;
    
    console.log('Saving task with data:', editTask);
    
    updateTaskMutation.mutate({
      id: editTask.id,
      title: editTask.title,
      description: editTask.description,
      startDate: editTask.startDate,
      dueDate: editTask.dueDate,
      priority: editTask.priority,
      status: editTask.status,
      category: editTask.category,
      recurrence: editTask.recurrence,
      notes: editTask.notes
    });
  }, [editTask, updateTaskMutation])

  const handleStatusChange = useCallback((status: TaskStatus) => {
    if (isEditing && editTask) {
      setEditTask(prev => ({...prev, status}))
    } else if (selectedTask) {
      updateTaskMutation.mutate({
        id: selectedTask.id,
        status
      })
    }
  }, [isEditing, editTask, selectedTask, updateTaskMutation])

  const handleEditTaskChange = useCallback((updates: Partial<Task>) => {
    setEditTask(prev => ({...prev, ...updates}))
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete)
      setIsDeleteDialogOpen(false)
    }
  }, [taskToDelete, deleteTaskMutation])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleNewTaskChange = useCallback((updates: Partial<NewTask>) => {
    setNewTask(prev => ({...prev, ...updates}))
  }, [])

  const handleQuickStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    console.log('handleQuickStatusChange called with:', taskId, status);
    console.log('Status type:', typeof status);
    console.log('Is valid TaskStatus?', Object.values(TaskStatus).includes(status));
    
    // Make sure we're working with a valid TaskStatus value
    if (Object.values(TaskStatus).includes(status)) {
      updateTaskMutation.mutate({
        id: taskId,
        status
      });
    } else {
      console.error('Invalid TaskStatus value:', status);
    }
  }, [updateTaskMutation]);

  const handleQuickDelete = useCallback((taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleEditTaskFromCard = useCallback((task: Task) => {
    setSelectedTask(task);
    setEditTask({...task});
    setIsEditing(true);
  }, []);

  const handleViewChange = (value: string) => {
    if (value) {
      setViewMode(value as 'list' | 'board' | 'focus')
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex h-full">
      {/* Fix the sidebar positioning by making it absolutely positioned or adding overflow handling */}
      <div className="flex-1 overflow-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
          {/* Main Header */}
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Left side - Title and Add Button */}
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Tasks</h1>
                <Button onClick={() => setIsAddTaskOpen(true)} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
              
              {/* Right side - View Toggle */}
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange}>
                  <ToggleGroupItem value="list" aria-label="List View">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="board" aria-label="Board View">
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="focus" aria-label="Focus Mode">
                    <Focus className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Section */}
        {viewMode !== 'focus' && (
          <div className="px-6 py-3 border-t">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search box */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Status filters - Add a fixed width container with overflow handling */}
              <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <div className="flex items-center gap-2 min-w-max"> {/* min-w-max prevents wrapping */}
                  <Button
                    variant={statusFilter === 'ALL' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('ALL')}
                    className="shrink-0"
                  >
                    All
                  </Button>
                  {Object.values(TaskStatus).map(status => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="gap-2 shrink-0"
                    >
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        status === TaskStatus.TODO && "bg-yellow-500",
                        status === TaskStatus.IN_PROGRESS && "bg-blue-500",
                        status === TaskStatus.COMPLETED && "bg-green-500",
                        status === TaskStatus.ARCHIVED && "bg-gray-500"
                      )} />
                      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="h-[calc(100vh-8rem)] overflow-y-auto px-6 pt-2 pb-6">
          {/* Conditional View Rendering */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {/* List header */}
              <div className="hidden sm:flex items-center border-b pb-2 px-4 gap-3 text-xs uppercase font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pt-2">
                <div className="w-6 ml-0.5"></div> {/* Checkbox column - added ml-0.5 for alignment */}
                <div className="flex-1 pl-3">Task</div> {/* Added pl-3 to match task content padding */}
                <div className="hidden sm:block w-[120px] text-center">Category</div> {/* Changed width and added text-center */}
                <div className="hidden md:block w-[140px] text-center">Due Date</div> {/* Changed width and added text-center */}
                <div className="hidden lg:block w-[100px] text-center">Status</div> {/* Changed width and added text-center */}
                <div className="w-8 mr-1"></div> {/* Actions column - added mr-1 for alignment */}
              </div>

              {Object.entries(groupedTasks).map(([group, groupTasks]) => (
                <div key={group} className="space-y-3">
                  <h3 className="text-sm font-medium px-4 py-2 sticky top-[4.5rem] z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-muted/40 mb-2">
                    {group === 'today' ? 'Today' : 
                     group === 'tomorrow' ? 'Tomorrow' : 
                     'Upcoming'}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({groupTasks.length})
                    </span>
                  </h3>
                  
                  {groupTasks.length > 0 ? (
                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden mt-2">
                      {groupTasks.map(task => (
                        <TaskListItem
                          key={task.id}
                          task={task}
                          onSelect={handleSelectTask}
                          onEdit={handleEditTaskFromCard}
                          onStatusChange={(task, newStatus) => handleQuickStatusChange(task.id, newStatus)}
                          onDelete={handleQuickDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg border shadow-sm p-4 text-center text-muted-foreground">
                      No tasks in this section
                    </div>
                  )}
                </div>
              ))}
              
              {!isLoading && tasks?.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No tasks yet. Click "Add Task" to create one.
                </div>
              )}
            </div>
          )}

          {viewMode === 'board' && (
            <BoardView 
              tasks={tasks?.filter(task => 
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (statusFilter === 'ALL' || task.status === statusFilter)
              ) || []}
              onSelectTask={handleSelectTask}
              onEditTask={handleEditTaskFromCard}
              onStatusChange={handleQuickStatusChange}
              onDeleteTask={handleQuickDelete}
            />
          )}

          {viewMode === 'focus' && (
            <FocusMode 
              tasks={tasks?.filter(task => 
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (statusFilter === 'ALL' || task.status === statusFilter)
              ) || []}
              onSelectTask={handleSelectTask}
              onEditTask={handleEditTaskFromCard}
              onStatusChange={handleQuickStatusChange}
              onDeleteTask={handleQuickDelete}
              focusDate={focusDate}
              onDateChange={setFocusDate}
              onAddTask={() => setIsAddTaskOpen(true)}
            />
          )}
        </div>
      </div>

      <Sheet open={!!selectedTask} onOpenChange={(open) => {
        if (!open) {
          setSelectedTask(null)
          setEditTask(null)
          setIsEditing(false)
        }
      }}>
        <TaskDetail
          task={selectedTask}
          isEditing={isEditing}
          editTask={editTask}
          onEdit={handleEditTask}
          onCancelEdit={handleCancelEdit}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onEditTaskChange={handleEditTaskChange}
          onClose={() => setSelectedTask(null)}
        />
      </Sheet>

      {/* Add Task Dialog */}
      <CreateTaskDialog
        isOpen={isAddTaskOpen}
        newTask={newTask}
        onClose={() => setIsAddTaskOpen(false)}
        onChange={handleNewTaskChange}
        onSubmit={handleAddTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Tasks