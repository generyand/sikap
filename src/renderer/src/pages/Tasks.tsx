import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import { 
  Plus, Search, MoreVertical, Calendar, Clock,
  Briefcase, // Work
  User, // Personal
  ShoppingCart, // Shopping
  Heart, // Health
  GraduationCap, // Education
  Wallet, // Finance
  Home, // Home
  FolderKanban, // Other
  FileText,
  StickyNote,
  Trash2,
  Pencil,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from '@prisma/client'
import { TaskPriority, TaskStatus, TaskCategory, RecurrencePattern, NewTask } from '../types/task'
import React from 'react'
import { format, isSameDay, formatDistanceToNow } from 'date-fns'
import { Switch } from "@/components/ui/switch"
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

const categoryColorMap: Record<TaskCategory, { 
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

const priorityColorMap: Record<TaskPriority, {
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
    notes: null
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
    mutationFn: (taskData: NewTask & { profileId: string }) => createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] })
      setIsAddTaskOpen(false)
      setNewTask({
        title: '',
        description: null,
        startDate: null,
        dueDate: null,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        category: null,
        recurrence: null,
        notes: null
      })
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

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    createTaskMutation.mutate({
      ...newTask,
      profileId: profileId as string
    })
  }

  const handleEditTask = () => {
    if (!selectedTask) return
    setEditTask({...selectedTask})
    setIsEditing(true)
  }

  const handleSaveTask = () => {
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
  }

  const handleStatusChange = (status: TaskStatus) => {
    if (isEditing && editTask) {
      setEditTask(prev => ({...prev, status}))
    } else if (selectedTask) {
      updateTaskMutation.mutate({
        id: selectedTask.id,
        status
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }

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
                      onSelect={() => setSelectedTask(task)}
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
                        onSelect={() => setSelectedTask(task)}
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
                        onSelect={() => setSelectedTask(task)}
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
        <SheetContent className="sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              {isEditing ? 'Edit Task' : 'Task Details'}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditTask}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditTask(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSaveTask}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedTask && (
            <div className="mt-6 space-y-6">
              {/* Title & Description */}
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
                      <Input
                        id="edit-title"
                        value={editTask?.title || ''}
                        onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editTask?.description || ''}
                        onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value || null }))}
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-medium">{selectedTask.title}</h3>
                    {selectedTask.description && (
                      <p className="text-muted-foreground">{selectedTask.description}</p>
                    )}
                  </>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TaskStatus).map(status => (
                    <Badge 
                      key={status}
                      variant={
                        (isEditing ? editTask?.status : selectedTask.status) === status 
                          ? "default" 
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleStatusChange(status)}
                    >
                      <div className={cn(
                        "h-2 w-2 rounded-full mr-1.5",
                        status === TaskStatus.TODO && "bg-yellow-500",
                        status === TaskStatus.IN_PROGRESS && "bg-blue-500",
                        status === TaskStatus.COMPLETED && "bg-green-500",
                        status === TaskStatus.ARCHIVED && "bg-gray-500"
                      )} />
                      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Dates</h4>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={editTask?.startDate?.toISOString().slice(0, 16) || ''}
                        onChange={(e) => setEditTask(prev => ({
                          ...prev,
                          startDate: e.target.value ? new Date(e.target.value) : null
                        }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Due Date</Label>
                      <Input
                        type="datetime-local"
                        value={editTask?.dueDate?.toISOString().slice(0, 16) || ''}
                        onChange={(e) => setEditTask(prev => ({
                          ...prev,
                          dueDate: e.target.value ? new Date(e.target.value) : null
                        }))}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p>{selectedTask.startDate 
                        ? format(new Date(selectedTask.startDate), 'MMM d, yyyy h:mm a') 
                        : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p>{selectedTask.dueDate 
                        ? format(new Date(selectedTask.dueDate), 'MMM d, yyyy h:mm a') 
                        : 'Not set'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority & Category */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Details</h4>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Priority</Label>
                      <Select
                        value={editTask?.priority || ''}
                        onValueChange={(value) => setEditTask(prev => ({ 
                          ...prev, 
                          priority: value as TaskPriority 
                        }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TaskPriority).map(priority => (
                            <SelectItem key={priority} value={priority}>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  priorityColorMap[priority].badge
                                )} />
                                {priority.charAt(0) + priority.slice(1).toLowerCase()}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Category</Label>
                      <Select
                        value={editTask?.category || ''}
                        onValueChange={(value) => setEditTask(prev => ({ 
                          ...prev, 
                          category: value as TaskCategory || null 
                        }))}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TaskCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                {React.createElement(categoryColorMap[category].icon, { 
                                  className: cn("h-4 w-4", categoryColorMap[category].text)
                                })}
                                {category.charAt(0) + category.slice(1).toLowerCase()}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <Badge 
                        className={cn(
                          "text-xs font-medium",
                          priorityColorMap[selectedTask.priority].badge
                        )}
                      >
                        {selectedTask.priority.charAt(0) + selectedTask.priority.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Category</p>
                      {selectedTask.category ? (
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs",
                          categoryColorMap[selectedTask.category].bg,
                          categoryColorMap[selectedTask.category].text,
                          categoryColorMap[selectedTask.category].border
                        )}>
                          {React.createElement(categoryColorMap[selectedTask.category].icon, { className: "h-3.5 w-3.5" })}
                          <span>
                            {selectedTask.category.charAt(0) + selectedTask.category.slice(1).toLowerCase()}
                          </span>
                        </div>
                      ) : (
                        <p>Not set</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium">Notes</h4>
                {isEditing ? (
                  <Textarea
                    value={editTask?.notes || ''}
                    onChange={(e) => setEditTask(prev => ({ 
                      ...prev, 
                      notes: e.target.value || null 
                    }))}
                    placeholder="Add any additional notes..."
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.notes || 'No notes added'}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{format(new Date(selectedTask.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{format(new Date(selectedTask.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {selectedTask.completedAt && (
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>{format(new Date(selectedTask.completedAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="gap-2"
                  onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Task
                </Button>
                
                {!isEditing && (
                  <Button 
                    variant={selectedTask.status === TaskStatus.COMPLETED ? "outline" : "default"}
                    size="sm"
                    className="gap-2"
                    onClick={() => handleStatusChange(
                      selectedTask.status === TaskStatus.COMPLETED 
                        ? TaskStatus.TODO 
                        : TaskStatus.COMPLETED
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {selectedTask.status === TaskStatus.COMPLETED ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className={cn(
          "max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto",
          // Custom Scrollbar Styles
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20",
          "hover:scrollbar-thumb-muted-foreground/40 active:scrollbar-thumb-muted-foreground/60",
          "dark:scrollbar-thumb-muted-foreground/10 dark:hover:scrollbar-thumb-muted-foreground/20",
          "dark:active:scrollbar-thumb-muted-foreground/30"
        )}>
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-xl">Add New Task</DialogTitle>
            <p className="text-sm text-muted-foreground">Fill in the task details. Required fields are marked with *</p>
          </DialogHeader>
          
          {/* Main Form Content */}
          <div className="space-y-6 py-4">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value || null }))}
                  placeholder="Enter task description"
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>

            {/* Dates & Priority Section */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduling
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTask.startDate?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => setNewTask(prev => ({
                      ...prev,
                      startDate: e.target.value ? new Date(e.target.value) : null
                    }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm">Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={newTask.dueDate?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => setNewTask(prev => ({
                      ...prev,
                      dueDate: e.target.value ? new Date(e.target.value) : null
                    }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Task Details Section */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Task Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as TaskPriority }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map(priority => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              priorityColorMap[priority].badge
                            )} />
                            {priority.charAt(0) + priority.slice(1).toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={newTask.category || ''}
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as TaskCategory || null }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {React.createElement(categoryColorMap[category].icon, { 
                              className: cn("h-4 w-4", categoryColorMap[category].text)
                            })}
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              {/* Recurrence Toggle */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Recurrence</h4>
                  <p className="text-sm text-muted-foreground">Repeat this task on a schedule</p>
                </div>
                <Switch
                  checked={!!newTask.recurrence}
                  onCheckedChange={(checked) => 
                    setNewTask(prev => ({
                      ...prev,
                      recurrence: checked ? RecurrencePattern.DAILY : null
                    }))
                  }
                />
              </div>

              {newTask.recurrence && (
                <div className="pl-0 md:pl-4">
                  <Label className="text-sm">Frequency</Label>
                  <Select
                    value={newTask.recurrence}
                    onValueChange={(value) => setNewTask(prev => ({ 
                      ...prev, 
                      recurrence: value as RecurrencePattern
                    }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RecurrencePattern).map(pattern => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.charAt(0) + pattern.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes Section */}
              <div className="pt-2">
                <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newTask.notes || ''}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    notes: e.target.value || null 
                  }))}
                  placeholder="Add any additional notes or details..."
                  className="mt-1.5 min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

const TaskCard = ({ task, onSelect }: { task: Task, onSelect: () => void }) => {
  return (
    <div
      onClick={onSelect}
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
}

export default Tasks