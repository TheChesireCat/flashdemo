import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, Target, TrendingUp } from "lucide-react"

interface StatsDashboardProps {
  stats: {
    totalCards: number
    dueCards: number
    reviewedToday: number
    averageEfactor: number
  }
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Total Cards</CardTitle>
          <Brain className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{stats.totalCards}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Due Today</CardTitle>
          <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.dueCards}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Reviewed Today</CardTitle>
          <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.reviewedToday}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Avg. E-Factor</CardTitle>
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold">{stats.averageEfactor}</div>
          <Badge variant={stats.averageEfactor >= 2.5 ? "default" : "secondary"} className="text-xs mt-1">
            {stats.averageEfactor >= 2.5 ? "Good" : "Needs Work"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
