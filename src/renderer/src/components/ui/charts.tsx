import { Bar, BarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card } from "./card"

// Add chart colors to your CSS (globals.css or similar)
const chartConfig = {
  colors: {
    blue: "hsl(220 70% 50%)",
    green: "hsl(160 60% 45%)",
    orange: "hsl(30 80% 55%)",
    purple: "hsl(280 65% 60%)",
    red: "hsl(340 75% 55%)",
  }
}

export function PieChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill={chartConfig.colors.blue}
          label
        />
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export function LineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={chartConfig.colors.blue} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
} 