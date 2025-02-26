import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  LayoutGrid, 
  ListTodo, 
  Clock, 
  Bell, 
  Settings, 
  Search,
  Plus,
  Calendar as CalendarIcon,
  Star,
  Clock3,
  Tag,
  MoreVertical
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Mock data for development
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    priority: 'high',
    dueDate: '2024-03-20',
    tags: ['work', 'urgent'],
    status: 'in-progress'
  },
  {
    id: '2',
    title: 'Weekly Team Meeting',
    priority: 'medium',
    dueDate: '2024-03-19',
    tags: ['meeting'],
    status: 'upcoming'
  },
  // Add more mock tasks...
]

export const TaskDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl">
          {/* Profile Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold truncate">John Doe</h2>
                <p className="text-xs text-muted-foreground">Premium Plan</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-1">
            <NavItem icon={LayoutGrid} active>Dashboard</NavItem>
            <NavItem icon={ListTodo}>Tasks</NavItem>
            <NavItem icon={Calendar}>Calendar</NavItem>
            <NavItem icon={Clock}>Timeline</NavItem>
            <NavItem icon={Bell}>Notifications</NavItem>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tasks..." 
                    className="pl-10 bg-muted/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Total Tasks" 
                value="24" 
                trend="+12% from last week"
                icon={ListTodo}
              />
              <StatCard 
                title="Due Today" 
                value="8" 
                trend="3 completed"
                icon={CalendarIcon}
              />
              <StatCard 
                title="High Priority" 
                value="5" 
                trend="2 overdue"
                icon={Star}
              />
              <StatCard 
                title="Completed" 
                value="16" 
                trend="This week"
                icon={Clock3}
              />
            </div>

            {/* Tasks Section */}
            <div className="grid grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <TaskColumn 
                title="Today's Tasks" 
                count={5}
                tasks={MOCK_TASKS.slice(0, 3)}
              />
              
              {/* In Progress */}
              <TaskColumn 
                title="In Progress" 
                count={3}
                tasks={MOCK_TASKS.slice(1, 4)}
              />
              
              {/* Completed */}
              <TaskColumn 
                title="Completed" 
                count={8}
                tasks={MOCK_TASKS.slice(2, 5)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper Components
const NavItem = ({ 
  icon: Icon, 
  children, 
  active 
}: { 
  icon: any; 
  children: React.ReactNode; 
  active?: boolean 
}) => (
  <button
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </button>
)

const StatCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  trend: string;
  icon: any;
}) => (
  <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className="text-muted-foreground text-sm font-medium">{title}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-semibold">{value}</h3>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  </div>
)

const TaskColumn = ({ 
  title, 
  count, 
  tasks 
}: { 
  title: string; 
  count: number;
  tasks: any[];
}) => (
  <div className="rounded-xl border bg-card">
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
    </div>
    <div className="p-2">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  </div>
)

const TaskCard = ({ task }: { task: any }) => (
  <div className="p-3 rounded-lg border bg-background/50 hover:bg-accent/5 
                  cursor-pointer transition-colors mb-2 last:mb-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate mb-1">{task.title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{task.tags.join(', ')}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <MoreVertical className="h-3 w-3" />
      </Button>
    </div>
  </div>
) 