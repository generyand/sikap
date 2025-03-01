import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import { 
  Plus, Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,

} from '@/components/ui/sheet'
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
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskDetail } from '@/components/tasks/TaskDetail'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] })
      setSelectedTask(null)
      setEditTask(null)
      setIsEditing(false)
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

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Main Header */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
                <Badge variant="secondary" className="rounded-md px-2">
                  {tasks?.length || 0} total
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddTaskOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-9 w-full md:max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
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
        </header>

        {/* Tasks List */}
        <div className="h-[calc(100vh-8rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Today Section */}
              <div className="col-span-full">
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">Today</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedTasks.today.map(task => (
                    <TaskCard 
                      key={task.id}
                      task={task}
                      onSelect={handleSelectTask}
                    />
                  ))}
                </div>
              </div>

              {/* Tomorrow Section */}
              {groupedTasks.tomorrow.length > 0 && (
                <div className="col-span-full">
                  <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tomorrow</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTasks.tomorrow.map(task => (
                      <TaskCard 
                        key={task.id}
                        task={task}
                        onSelect={handleSelectTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Section */}
              {groupedTasks.upcoming.length > 0 && (
                <div className="col-span-full">
                  <h2 className="mb-3 text-sm font-medium text-muted-foreground">Upcoming</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTasks.upcoming.map(task => (
                      <TaskCard 
                        key={task.id}
                        task={task}
                        onSelect={handleSelectTask}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* No Tasks */}
            {!isLoading && tasks?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No tasks yet. Click "Add Task" to create one.
              </div>
            )}
          </div>
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