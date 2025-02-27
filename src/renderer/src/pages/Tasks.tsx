import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '../providers/ProfileProvider'
import { fetchTasks, createTask } from '../services/taskService'
import { Plus, Search, Filter, MoreVertical, Circle, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskPriority, TaskStatus, TaskCategory, RecurrencePattern } from '@prisma/client'

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

  const { isLoading } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
  })

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

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              />
            </div>
          </div>
        </header>

        {/* Tasks List */}
        <div className="h-[calc(100vh-8rem)] overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Today Section */}
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Today</h2>
              <div className="space-y-1">
                <TaskItem 
                  title="Design new landing page"
                  completed={false}
                  dueTime="2:30 PM"
                  priority="high"
                />
                <TaskItem 
                  title="Review pull requests"
                  completed={true}
                  dueTime="11:00 AM"
                  priority="medium"
                />
              </div>
            </div>

            {/* Tomorrow Section */}
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tomorrow</h2>
              <div className="space-y-1">
                <TaskItem 
                  title="Team standup meeting"
                  completed={false}
                  dueTime="9:00 AM"
                  priority="medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          {/* Task details content */}
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
                onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as TaskPriority }))}
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
                onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value as TaskCategory || null }))}
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

type TaskItemProps = {
  title: string
  completed: boolean
  dueTime?: string
  priority?: 'low' | 'medium' | 'high'
}

const TaskItem = ({ title, completed, dueTime, priority }: TaskItemProps) => {
  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-accent/50",
      completed && "opacity-50"
    )}>
      <Button variant="ghost" size="icon" className="rounded-full p-1 hover:bg-accent">
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
      
      <div className="flex-1">
        <p className={cn(
          "text-sm",
          completed && "line-through"
        )}>{title}</p>
        {dueTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {dueTime}
          </div>
        )}
      </div>

      {priority && (
        <Badge variant={
          priority === 'high' ? 'destructive' : 
          priority === 'medium' ? 'secondary' : 
          'outline'
        }>
          {priority}
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Move to...</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Tasks