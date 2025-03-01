import React from 'react'
import { 
  ListTodo, 
  Calendar as CalendarIcon,
  Star,
  Clock3,
  CalendarRange,
  LayoutDashboard,
  Filter,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer 
} from 'recharts'
import { Button } from "@/components/ui/button"
import { TaskCategory } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Add color constants
const PRIORITY_COLORS = {
  LOW: '#10B981',    // Green
  MEDIUM: '#F59E0B', // Yellow
  HIGH: '#EF4444',   // Red
  URGENT: '#7C3AED'  // Purple
}

const CATEGORY_COLORS = {
  WORK: '#3B82F6',
  PERSONAL: '#EC4899',
  SHOPPING: '#F59E0B',
  HEALTH: '#10B981',
  EDUCATION: '#6366F1',
  FINANCE: '#059669',
  HOME: '#8B5CF6',
  OTHER: '#6B7280'
}

// Mock data for charts
const tasksByStatusData = [
  { name: 'Todo', value: 30 },
  { name: 'In Progress', value: 15 },
  { name: 'Completed', value: 45 },
  { name: 'Archived', value: 10 }
]

const taskCompletionTrendData = [
  { date: '2024-03-01', completed: 5, created: 8 },
  { date: '2024-03-02', completed: 7, created: 6 },
  // ... more data points
]

const tasksByPriorityData = [
  { priority: 'Low', count: 12 },
  { priority: 'Medium', count: 24 },
  { priority: 'High', count: 8 },
  { priority: 'Urgent', count: 4 }
]

// Mock data for development

const TaskDashboard: React.FC = () => {

  return (
    <div className="min-h-screen bg-background">
      {/* Main Layout */}
      <div className="flex h-screen">

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Date Range Selector */}
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Button */}
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                {/* Export Button */}
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
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

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Task Status Distribution */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tasksByStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {tasksByStatusData.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={Object.values(CATEGORY_COLORS)[index % Object.values(CATEGORY_COLORS).length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Task Completion Trend */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Task Completion Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={taskCompletionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                    <Line type="monotone" dataKey="created" stroke="#6366F1" name="Created" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tasks by Priority */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tasksByPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {tasksByPriorityData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(PRIORITY_COLORS)[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Distribution */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(TaskCategory).map(([category, _count]) => ({
                        name: category,
                        value: Math.floor(Math.random() * 30) // Replace with actual data
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {Object.keys(CATEGORY_COLORS).map((category, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[category]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


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

export default TaskDashboard