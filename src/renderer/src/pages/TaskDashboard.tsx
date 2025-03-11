import React, { useMemo, useState } from 'react'
import { 
  ListTodo, 
  Calendar as CalendarIcon,
  Star,
  Clock3,
  CalendarRange,
  LayoutDashboard,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Table,
  FileSpreadsheet,
  BarChart as Chart
} from 'lucide-react'
import { 
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
import { format, subDays, startOfDay, endOfDay, isToday, isThisWeek } from 'date-fns'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast, Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { window, DashboardData } from '@/lib/electron'

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

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border">
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Custom legend component
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

const TaskDashboard: React.FC = () => {
  const { profileId } = useProfile()
  const [timeframe, setTimeframe] = useState('7days')
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  // Replace mock data with real data from TaskService
  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard', profileId, timeframe],
    queryFn: async () => {
      if (!profileId) throw new Error('No profile selected');
      
      try {
        console.log('Fetching dashboard data for profile:', profileId, 'timeframe:', timeframe);
        const rawData = await window.taskService.getDashboardData(profileId, timeframe);
        console.log('Raw dashboard data:', rawData);

        const { tasks = [], previousPeriodTaskCount = 0 } = rawData;
        
        // Return empty state if no tasks
        if (!tasks || tasks.length === 0) {
          console.log('No tasks found, returning empty state');
          return {
            stats: {
              totalTasks: 0,
              dueToday: 0,
              highPriority: 0,
              completedThisWeek: 0,
              taskTrend: 0
            },
            charts: {
              statusData: Object.values(TaskStatus).map(status => ({ name: status, value: 0 })),
              priorityData: Object.values(TaskPriority).map(priority => ({ priority, count: 0 })),
              categoryData: Object.values(TaskCategory).map(category => ({ name: category, value: 0 })),
              completionTrend: Array.from({ length: timeframe === 'today' ? 1 : parseInt(timeframe.replace('days', '')) }, 
                (_, i) => ({
                  date: format(subDays(new Date(), i), 'MMM dd'),
                  completed: 0,
                  created: 0
                })
              ).reverse()
            }
          };
        }

        const now = new Date();
        
        // Calculate statistics
        const totalTasks = tasks.length;
        const dueToday = tasks.filter(task => {
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          return dueDate && isToday(dueDate);
        }).length;

        const highPriority = tasks.filter(task => 
      task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT
        ).length;

        const completedThisWeek = tasks.filter(task => 
      task.status === TaskStatus.COMPLETED && 
      task.completedAt && 
      isThisWeek(new Date(task.completedAt))
        ).length;

        // Calculate trend
        const taskTrend = previousPeriodTaskCount > 0 
          ? ((totalTasks - previousPeriodTaskCount) / previousPeriodTaskCount) * 100 
          : 0;

        // Prepare chart data
    const statusData = Object.values(TaskStatus).map(status => ({
      name: status,
          value: tasks.filter(task => task.status === status).length
        }));

    const priorityData = Object.values(TaskPriority).map(priority => ({
      priority,
          count: tasks.filter(task => task.priority === priority).length
        }));

    const categoryData = Object.values(TaskCategory).map(category => ({
      name: category,
          value: tasks.filter(task => task.category === category).length
        }));

        // Generate daily completion trend
        const days = timeframe === 'today' ? 1 : parseInt(timeframe.replace('days', ''));
    const completionTrend = Array.from({ length: days }, (_, i) => {
          const date = subDays(now, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
      
      return {
        date: format(date, 'MMM dd'),
            completed: tasks.filter(task => 
          task.status === TaskStatus.COMPLETED && 
          task.completedAt && 
          new Date(task.completedAt) >= dayStart &&
          new Date(task.completedAt) <= dayEnd
        ).length,
            created: tasks.filter(task => 
          task.createdAt &&
          new Date(task.createdAt) >= dayStart &&
          new Date(task.createdAt) <= dayEnd
        ).length
          };
        }).reverse();

        const processedData: DashboardData = {
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
        };

        console.log('Processed dashboard data:', processedData);
        return processedData;

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw new Error('Failed to load dashboard data. Please try again later.');
      }
    },
    enabled: !!profileId,
    refetchInterval: 5000, // Reduce interval to 5 seconds for testing
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Consider data immediately stale
  });

  const handleExport = async (format: string, type: string) => {
    setExportLoading(`${type}-${format}`)
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let exportData
      if (type === 'all') {
        exportData = {
          stats: dashboardData?.stats,
          charts: dashboardData?.charts,
          timeframe,
          exportedAt: new Date().toISOString()
        }
      } else if (type === 'stats') {
        exportData = {
          stats: dashboardData?.stats,
          timeframe,
          exportedAt: new Date().toISOString()
        }
      } else {
        exportData = {
          [type]: dashboardData?.charts[type],
          timeframe,
          exportedAt: new Date().toISOString()
        }
      }

      // In a real app, you would use proper export libraries here
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `task-dashboard-${type}-${format}-${timeframe}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Successfully exported ${type} data as ${format}`, {
        description: "Your file has been downloaded successfully."
      })
    } catch (error) {
      toast.error('Export failed', {
        description: "There was an error exporting your data. Please try again."
      })
    } finally {
      setExportLoading(null)
    }
  }

  const headerActions = (
    <>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur opacity-70" />
          <div className="relative bg-primary/10 p-2 rounded-lg shadow-sm">
            <CalendarRange className="h-4 w-4 text-primary" />
          </div>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] bg-card hover:bg-accent transition-colors">
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

      <div className="h-6 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 bg-card hover:bg-accent transition-colors"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-lg blur opacity-70" />
              <div className="relative bg-primary/10 p-1.5 rounded-lg">
                <Download className="h-4 w-4 text-primary" />
              </div>
            </div>
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-card border-border">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Export Dashboard Data</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/40" />
          
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="focus:bg-background/80">
                <FileText className="mr-2 h-4 w-4" />
                <span>Complete Dashboard</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-background/95 backdrop-blur-xl border-border/40">
                  <DropdownMenuItem 
                    onClick={() => handleExport('CSV', 'all')} 
                    disabled={exportLoading === 'all-CSV'}
                    className="focus:bg-background/80"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    <span>As CSV</span>
                    {exportLoading === 'all-CSV' && (
                      <Download className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('JSON', 'all')} 
                    disabled={exportLoading === 'all-JSON'}
                    className="focus:bg-background/80"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>As JSON</span>
                    {exportLoading === 'all-JSON' && (
                      <Download className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="focus:bg-background/80">
                <Table className="mr-2 h-4 w-4" />
                <span>Statistics Only</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-background/95 backdrop-blur-xl border-border/40">
                  <DropdownMenuItem 
                    onClick={() => handleExport('CSV', 'stats')} 
                    disabled={exportLoading === 'stats-CSV'}
                    className="focus:bg-background/80"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    <span>As CSV</span>
                    {exportLoading === 'stats-CSV' && (
                      <Download className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('JSON', 'stats')} 
                    disabled={exportLoading === 'stats-JSON'}
                    className="focus:bg-background/80"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>As JSON</span>
                    {exportLoading === 'stats-JSON' && (
                      <Download className="ml-auto h-4 w-4 animate-spin" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Export Individual Charts</DropdownMenuLabel>

          <DropdownMenuGroup>
            {['statusData', 'priorityData', 'categoryData', 'completionTrend'].map((chartType) => (
              <DropdownMenuSub key={chartType}>
                <DropdownMenuSubTrigger className="focus:bg-background/80">
                  <Chart className="mr-2 h-4 w-4" />
                  <span>{chartType.replace(/([A-Z])/g, ' $1').trim()}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <DropdownMenuItem 
                      onClick={() => handleExport('CSV', chartType)}
                      disabled={exportLoading === `${chartType}-CSV`}
                      className="focus:bg-background/80"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      <span>As CSV</span>
                      {exportLoading === `${chartType}-CSV` && (
                        <Download className="ml-auto h-4 w-4 animate-spin" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport('JSON', chartType)}
                      disabled={exportLoading === `${chartType}-JSON`}
                      className="focus:bg-background/80"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>As JSON</span>
                      {exportLoading === `${chartType}-JSON` && (
                        <Download className="ml-auto h-4 w-4 animate-spin" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="default" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Tasks Found</AlertTitle>
          <AlertDescription>
            There are no tasks in the selected timeframe. Create some tasks to see your dashboard statistics.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" expand={true} richColors />
      <div className="flex h-screen">
        <main className="flex-1 flex flex-col min-w-0">
          <Header 
            title="Dashboard"
            icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
            showDateTime={true}
            actions={headerActions}
          />

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
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {dashboardData?.charts.statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.name as TaskStatus]} 
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
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
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10B981" 
                        fillOpacity={1} 
                        fill="url(#completed)"
                        name="Completed"
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#6366F1" 
                        fillOpacity={1} 
                        fill="url(#created)"
                        name="Created"
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
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
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {dashboardData?.charts.priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PRIORITY_COLORS[entry.priority as TaskPriority]} 
                            stroke="white"
                            strokeWidth={1}
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
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {dashboardData?.charts.categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name as TaskCategory]} 
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
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
    whileHover={{ scale: 1.02, y: -2 }}
    className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-200 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    <div className="relative">
    <div className="flex items-center justify-between mb-4">
      <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
    </div>
    <div className="space-y-2">
        <h3 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          {value}
        </h3>
      <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={`h-4 w-4 ${trendColor} group-hover:scale-110 transition-transform duration-200`} />
        <span className="text-muted-foreground">{trend}</span>
        </div>
      </div>
    </div>
  </motion.div>
)

export default TaskDashboard