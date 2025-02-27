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

export const Tasks = () => {
  const { profileId } = useProfile()
  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => fetchTasks(profileId),
  })

  const { mutate: addTask } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', profileId] })
    },
  })

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
              <Button>
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