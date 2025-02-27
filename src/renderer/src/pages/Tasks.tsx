import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks, createTask } from '../services/taskService'
import { 
  Plus, Search, Filter, MoreVertical, Calendar, Clock,
  Briefcase, // Work
  User, // Personal
  ShoppingCart, // Shopping
  Heart, // Health
  GraduationCap, // Education
  Wallet, // Finance
  Home, // Home
  FolderKanban, // Other
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from '@prisma/client'
import { TaskPriority, TaskStatus, TaskCategory, RecurrencePattern } from '../types/task'
import React from 'react'
import { format, isSameDay, formatDistanceToNow } from 'date-fns'

interface NewTask {
  title: string
  description: string | null
  startDate: Date | null
  dueDate: Date | null
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory | null
  reminder: Date | null
  recurrence: RecurrencePattern | null
  notes: string | null
}

const categoryColorMap: Record<typeof TaskCategory[keyof typeof TaskCategory], { 
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
    reminder: null,
    recurrence: null,
    notes: null
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof TaskStatus[keyof typeof TaskStatus] | 'ALL'>('ALL')

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
  })

  const groupedTasks = React.useMemo(() => {
    if (!tasks) return { today: [], tomorrow: [], upcoming: [] }
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.reduce((acc, task) => {
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
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks?.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'ALL' || task.status === statusFilter)
    )
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
        reminder: null,
        recurrence: null,
        notes: null
      })
    }
  })

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    createTaskMutation.mutate({
      ...newTask,
      profileId: profileId as string
    })
  }

  const TaskFilter = () => {
    return (
      <div className="flex gap-2 mb-6">
        {Object.values(TaskStatus).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="gap-2"
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              status === TaskStatus.TODO && "bg-yellow-500",
              status === TaskStatus.IN_PROGRESS && "bg-blue-500",
              status === TaskStatus.COMPLETED && "bg-green-500"
            )} />
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>
    )
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="border-b bg-gradient-to-b from-background to-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Tasks</DropdownMenuItem>
                  <DropdownMenuItem>Active</DropdownMenuItem>
                  <DropdownMenuItem>Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsAddTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Tasks List */}
        <div className="h-[calc(100vh-8rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <TaskFilter />
            
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

      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="space-y-4">
            {/* Status Banner */}
            <div className={cn(
              "w-full h-1.5 rounded-full",
              selectedTask?.status === TaskStatus.TODO && "bg-yellow-500",
              selectedTask?.status === TaskStatus.IN_PROGRESS && "bg-blue-500",
              selectedTask?.status === TaskStatus.COMPLETED && "bg-green-500"
            )} />

            {/* Title & Status */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-xl">{selectedTask?.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Created {selectedTask?.createdAt && format(new Date(selectedTask.createdAt), 'PPP')}
                </p>
              </div>
              <Badge className="ml-2">{selectedTask?.status.toLowerCase()}</Badge>
            </div>
            
            {/* Tags Row */}
            <div className="flex flex-wrap gap-2">
              {selectedTask?.category && (
                <div className={cn(
                  "px-2 py-1 rounded-md border shadow-sm flex items-center gap-1.5",
                  categoryColorMap[selectedTask.category].bg,
                  categoryColorMap[selectedTask.category].text,
                  categoryColorMap[selectedTask.category].border
                )}>
                  {React.createElement(categoryColorMap[selectedTask.category].icon, { className: "h-3.5 w-3.5" })}
                  <span>{selectedTask.category.charAt(0) + selectedTask.category.slice(1).toLowerCase()}</span>
                </div>
              )}
              <Badge variant={
                selectedTask?.priority === TaskPriority.HIGH ? 'destructive' :
                selectedTask?.priority === TaskPriority.MEDIUM ? 'secondary' :
                'outline'
              }>
                {selectedTask?.priority.toLowerCase()}
              </Badge>
              {selectedTask?.recurrence && (
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  Repeats {selectedTask.recurrence.toLowerCase()}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{selectedTask?.description || 'No description'}</p>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Start Date</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTask?.startDate ? format(new Date(selectedTask.startDate), 'PPP p') : '-'}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Due Date</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTask?.dueDate ? format(new Date(selectedTask.dueDate), 'PPP p') : '-'}
                </p>
              </div>
            </div>

            {/* Reminder */}
            {selectedTask?.reminder && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedTask.reminder), 'PPP p')}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedTask?.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notes</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg bg-muted p-4">
                  {selectedTask.notes}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTask?.updatedAt && format(new Date(selectedTask.updatedAt), 'PPP p')}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
              <Button>Edit Task</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value || null }))}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={newTask.startDate?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    startDate: e.target.value ? new Date(e.target.value) : null
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={newTask.dueDate?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setNewTask(prev => ({
                    ...prev,
                    dueDate: e.target.value ? new Date(e.target.value) : null
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as typeof TaskPriority[keyof typeof TaskPriority] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newTask.category || ''}
                onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as typeof TaskCategory[keyof typeof TaskCategory] || null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
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
            <Badge variant={
              task.priority === TaskPriority.HIGH ? 'destructive' :
              task.priority === TaskPriority.MEDIUM ? 'secondary' :
              'outline'
            } className="text-xs font-medium shadow-sm">
              {task.priority.toLowerCase()}
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