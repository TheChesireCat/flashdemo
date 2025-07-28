"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Target, TrendingUp, RotateCcw } from "lucide-react"

interface CramSessionStatsProps {
  sessionStats: {
    cardsReviewed: number
    correctAnswers: number
    sessionStartTime: Date
    totalCards: number
    reviewedCardIds: Set<string>
  }
  onResetSession?: () => void
  showResetButton?: boolean
}

export function CramSessionStats({ 
  sessionStats, 
  onResetSession,
  showResetButton = false 
}: CramSessionStatsProps) {
  const { cardsReviewed, correctAnswers, sessionStartTime, totalCards, reviewedCardIds } = sessionStats
  
  const sessionDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000 / 60) // minutes
  const accuracyRate = cardsReviewed > 0 ? Math.round((correctAnswers / cardsReviewed) * 100) : 0
  const completionRate = totalCards > 0 ? Math.round((reviewedCardIds.size / totalCards) * 100) : 0
  const uniqueCardsReviewed = reviewedCardIds.size
  
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return "< 1 min"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const isSessionComplete = uniqueCardsReviewed >= totalCards && totalCards > 0

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-orange-500" />
            Cram Session Stats
          </CardTitle>
          {showResetButton && onResetSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetSession}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
        {isSessionComplete && (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 w-fit">
            Session Complete!
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Deck Progress</span>
            <span>{uniqueCardsReviewed}/{totalCards} cards</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {completionRate}% complete
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              Reviews
            </div>
            <div className="text-lg font-semibold">{cardsReviewed}</div>
            <div className="text-xs text-muted-foreground">
              {uniqueCardsReviewed} unique cards
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Accuracy
            </div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {accuracyRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              {correctAnswers}/{cardsReviewed} correct
            </div>
          </div>

          <div className="space-y-1 col-span-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Session Time
            </div>
            <div className="text-lg font-semibold">{formatDuration(sessionDuration)}</div>
            {cardsReviewed > 0 && (
              <div className="text-xs text-muted-foreground">
                ~{Math.round(sessionDuration / cardsReviewed * 10) / 10} min/card
              </div>
            )}
          </div>
        </div>

        {/* Session Summary */}
        {isSessionComplete && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              🎉 Cram Session Complete!
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              You've reviewed all {totalCards} cards in this deck. 
              {accuracyRate >= 80 ? " Excellent work!" : accuracyRate >= 60 ? " Good job!" : " Keep practicing!"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}