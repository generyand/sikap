import React, { useMemo } from 'react'
import { 
  ListTodo, 
  Calendar as CalendarIcon,
  Star,
  Clock3,
  CalendarRange,
  LayoutDashboard,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle
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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Button } from "@/components/ui/button"
import { TaskCategory, TaskStatus, TaskPriority } from '@/types'
import { useProfile } from '@/providers/ProfileProvider'
import { useQuery } from '@tanstack/react-query'
import { mockTasks } from '@/mocks/taskData'
import { format, subDays, startOfDay, endOfDay, isToday, isThisWeek, isThisMonth } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced color palette with semantic meaning
const PRIORITY_COLORS = {
  [TaskPriority.LOW]: '#10B981',    // Green - Calming, achievable
  [TaskPriority.MEDIUM]: '#F59E0B', // Yellow - Attention needed
  [TaskPriority.HIGH]: '#EF4444',   // Red - Urgent
  [TaskPriority.URGENT]: '#7C3AED'  // Purple - Critical
}

const STATUS_COLORS = {
  [TaskStatus.TODO]: '#6B7280',      // Gray - Not started
  [TaskStatus.IN_PROGRESS]: '#3B82F6', // Blue - Active
  [TaskStatus.COMPLETED]: '#10B981',   // Green - Success
  [TaskStatus.ARCHIVED]: '#8B5CF6'     // Purple - Archived
}

const CATEGORY_COLORS = {
  [TaskCategory.WORK]: '#3B82F6',     // Blue - Professional
  [TaskCategory.PERSONAL]: '#EC4899',  // Pink - Personal
  [TaskCategory.SHOPPING]: '#F59E0B',  // Yellow - Shopping
  [TaskCategory.HEALTH]: '#10B981',    // Green - Health
  [TaskCategory.EDUCATION]: '#6366F1',  // Indigo - Learning
  [TaskCategory.FINANCE]: '#059669',    // Emerald - Money
  [TaskCategory.HOME]: '#8B5CF6',      // Purple - Home
  [TaskCategory.OTHER]: '#6B7280'      // Gray - Other
}

const TaskDashboard: React.FC = () => {
  const { profileId } = useProfile()
  const [timeframe, setTimeframe] = React.useState('7days')

  // Use mock data instead of API call
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', profileId],
    queryFn: () => Promise.resolve(mockTasks),
    enabled: true, // Always enabled since we're using mock data
    initialData: mockTasks // Provide initial data to avoid loading state
  })

  // Memoized data transformations for performance
  const dashboardData = useMemo(() => {
    if (!tasks.length) return null

    const now = new Date()
    const startDate = timeframe === 'today' 
      ? startOfDay(now)
      : subDays(now, parseInt(timeframe.replace('days', '')))

    // Filter tasks based on timeframe
    const filteredTasks = tasks.filter(task => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null
      return taskDate && taskDate >= startDate
    })

    // Calculate statistics using filtered tasks
    const totalTasks = filteredTasks.length
    const dueToday = filteredTasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null
      return dueDate && isToday(dueDate)
    }).length

    const highPriority = filteredTasks.filter(task => 
      task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT
    ).length

    const completedThisWeek = filteredTasks.filter(task => 
      task.status === TaskStatus.COMPLETED && 
      task.completedAt && 
      isThisWeek(new Date(task.completedAt))
    ).length

    // Calculate trends using the previous period
    const previousPeriodStart = subDays(startDate, parseInt(timeframe.replace('days', '')))
    const previousPeriodTasks = tasks.filter(task => {
      const taskDate = task.createdAt ? new Date(task.createdAt) : null
      return taskDate && taskDate >= previousPeriodStart && taskDate < startDate
    }).length

    const taskTrend = previousPeriodTasks > 0 
      ? ((totalTasks - previousPeriodTasks) / previousPeriodTasks) * 100 
      : 0

    // Prepare chart data using filtered tasks
    const statusData = Object.values(TaskStatus).map(status => ({
      name: status,
      value: filteredTasks.filter(task => task.status === status).length
    }))

    const priorityData = Object.values(TaskPriority).map(priority => ({
      priority,
      count: filteredTasks.filter(task => task.priority === priority).length
    }))

    const categoryData = Object.values(TaskCategory).map(category => ({
      name: category,
      value: filteredTasks.filter(task => task.category === category).length
    }))

    // Generate daily completion trend within the selected timeframe
    const days = timeframe === 'today' ? 1 : parseInt(timeframe.replace('days', ''))
    const completionTrend = Array.from({ length: days }, (_, i) => {
      const date = subDays(now, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      return {
        date: format(date, 'MMM dd'),
        completed: filteredTasks.filter(task => 
          task.status === TaskStatus.COMPLETED && 
          task.completedAt && 
          new Date(task.completedAt) >= dayStart &&
          new Date(task.completedAt) <= dayEnd
        ).length,
        created: filteredTasks.filter(task => 
          task.createdAt &&
          new Date(task.createdAt) >= dayStart &&
          new Date(task.createdAt) <= dayEnd
        ).length
      }
    }).reverse()

    return {
      stats: {
        totalTasks,
        dueToday,
        highPriority,
        completedThisWeek,
        taskTrend
      },
      charts: {
        statusData,
        priorityData,
        categoryData,
        completionTrend
      }
    }
  }, [tasks, timeframe])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-muted-foreground" />
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </motion.div>
                ) : dashboardData ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-4 gap-4"
                  >
                    <StatCard 
                      title="Total Tasks" 
                      value={dashboardData.stats.totalTasks.toString()}
                      trend={`${dashboardData.stats.taskTrend > 0 ? '+' : ''}${dashboardData.stats.taskTrend.toFixed(1)}% from last period`}
                      icon={ListTodo}
                      trendIcon={dashboardData.stats.taskTrend > 0 ? TrendingUp : TrendingDown}
                      trendColor={dashboardData.stats.taskTrend > 0 ? 'text-green-500' : 'text-red-500'}
                    />
                    <StatCard 
                      title="Due Today" 
                      value={dashboardData.stats.dueToday.toString()}
                      trend="Tasks due today"
                      icon={CalendarIcon}
                      trendIcon={AlertTriangle}
                      trendColor="text-yellow-500"
                    />
                    <StatCard 
                      title="High Priority" 
                      value={dashboardData.stats.highPriority.toString()}
                      trend="Urgent tasks"
                      icon={Star}
                      trendIcon={AlertCircle}
                      trendColor="text-red-500"
                    />
                    <StatCard 
                      title="Completed" 
                      value={dashboardData.stats.completedThisWeek.toString()}
                      trend="This week"
                      icon={Clock3}
                      trendIcon={CheckCircle2}
                      trendColor="text-green-500"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Task Status Distribution</h3>
                    <Badge variant="outline" className="text-xs">
                      {timeframe} view
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData?.charts.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData?.charts.statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.name as TaskStatus]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} tasks`, '']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Task Completion Trend</h3>
                    <Badge variant="outline" className="text-xs">
                      {timeframe} view
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData?.charts.completionTrend}>
                      <defs>
                        <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                          <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#completed)"
                        name="Completed"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#6366F1" 
                        fillOpacity={1} 
                        fill="url(#created)"
                        name="Created"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Tasks by Priority</h3>
                    <Badge variant="outline" className="text-xs">
                      {timeframe} view
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData?.charts.priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="priority" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8">
                        {dashboardData?.charts.priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PRIORITY_COLORS[entry.priority as TaskPriority]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Tasks by Category</h3>
                    <Badge variant="outline" className="text-xs">
                      {timeframe} view
                    </Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData?.charts.categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardData?.charts.categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name as TaskCategory]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} tasks`, '']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon,
  trendIcon: TrendIcon,
  trendColor
}: { 
  title: string
  value: string
  trend: string
  icon: any
  trendIcon: any
  trendColor: string
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-muted-foreground text-sm font-medium">{title}</span>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
      <div className="flex items-center gap-2 text-sm">
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        <span className="text-muted-foreground">{trend}</span>
      </div>
    </div>
  </motion.div>
)

export default TaskDashboard