"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Code } from "lucide-react"
import type { Flashcard } from "../types/flashcard"
import type { SuperMemoGrade } from "supermemo"
import { CodeDisplay } from "./code-display"

interface FlashcardReviewProps {
  card: Flashcard
  onReview: (grade: SuperMemoGrade) => void
  onNext: () => void
  cardNumber: number
  totalCards: number
  isCramMode?: boolean
  cramSessionStats?: {
    cardsReviewed: number
    correctAnswers: number
    sessionStartTime: Date
    totalCards: number
    reviewedCardIds: Set<string>
  }
}

const gradeLabels = {
  0: "Complete blackout",
  1: "Incorrect, easy to recall",
  2: "Incorrect, hard to recall",
  3: "Correct, very hard",
  4: "Correct, hard",
  5: "Correct, easy",
}

const gradeColors = {
  0: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
  1: "bg-red-400 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600",
  2: "bg-orange-400 hover:bg-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600",
  3: "bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600",
  4: "bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600",
  5: "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
}

export function FlashcardReview({ card, onReview, onNext, cardNumber, totalCards, isCramMode = false, cramSessionStats }: FlashcardReviewProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showRawHtml, setShowRawHtml] = useState(false)

  // Add safety check for card
  if (!card) {
    return (
      <Card className="min-h-[250px] md:min-h-[300px]">
        <CardContent className="p-6 md:p-8 flex items-center justify-center">
          <p className="text-muted-foreground">No card available</p>
        </CardContent>
      </Card>
    )
  }

  const handleGrade = (grade: SuperMemoGrade) => {
    onReview(grade)
    setHasAnswered(true)
    setTimeout(() => {
      onNext()
      setIsFlipped(false)
      setHasAnswered(false)
      setShowRawHtml(false)
    }, 1000)
  }

  const formatInterval = (interval: number) => {
    if (interval < 1) return "Today"
    if (interval === 1) return "1 day"
    if (interval < 30) return `${Math.round(interval)} days`
    if (interval < 365) return `${Math.round(interval / 30)} months`
    return `${Math.round(interval / 365)} years`
  }

  const currentContent = isFlipped ? card.back : card.front
  const currentLanguage = isFlipped ? card.backLanguage : card.frontLanguage

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {isCramMode ? (
            <>
              <Badge variant="outline" className="self-start">
                {cramSessionStats ? `${cramSessionStats.reviewedCardIds.size}/${cramSessionStats.totalCards} unique` : `Card ${cardNumber} of ${totalCards}`}
              </Badge>
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-xs">
                CRAM MODE
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="self-start">
              Card {cardNumber} of {totalCards}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentLanguage && (
            <Badge variant="secondary" className="text-xs">
              {currentLanguage}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowRawHtml(!showRawHtml)} className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            {showRawHtml ? "Rendered" : "Raw"}
          </Button>
          {!isCramMode && (
            <div className="text-xs md:text-sm text-muted-foreground">Next: {formatInterval(card.interval)}</div>
          )}
          {isCramMode && (
            <div className="text-xs md:text-sm text-orange-600 dark:text-orange-400">
              Practice mode - intervals not updated
            </div>
          )}
        </div>
      </div>

      <Card className={`min-h-[250px] md:min-h-[300px] ${isCramMode ? 'border-orange-200 dark:border-orange-800' : ''}`}>
        <CardContent className="p-4 md:p-8">
          <div className="text-center space-y-4">
            <div className="text-base md:text-lg font-medium text-muted-foreground">
              {isFlipped ? "Answer" : "Question"}
              {isCramMode && (
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Practice Mode - No interval updates
                </div>
              )}
            </div>

            <div className="text-base md:text-xl leading-relaxed min-h-[100px] w-full min-w-0 text-left">
              {showRawHtml ? (
                <pre className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs md:text-sm bg-muted p-3 md:p-4 rounded-md font-mono text-left dark:bg-muted dark:text-foreground">
                  {currentContent}
                </pre>
              ) : currentLanguage ? (
                <div className="w-full max-w-full overflow-x-auto min-w-0">
                  <CodeDisplay code={currentContent} language={currentLanguage} className="w-full max-w-full text-left" />
                </div>
              ) : (
                <div className="w-full max-w-full overflow-x-auto min-w-0">
                  <div
                    className="prose prose-sm md:prose-lg max-w-none text-sm md:text-base dark:prose-invert break-words [overflow-wrap:anywhere] text-left"
                    dangerouslySetInnerHTML={{ __html: currentContent }}
                  />
                </div>
              )}
            </div>

            {!isFlipped && (
              <Button onClick={() => setIsFlipped(true)} className="mt-4" size="sm">
                <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Show Answer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isFlipped && !hasAnswered && (
        <div className="space-y-3">
          <div className="text-center text-sm font-medium">How well did you know this?</div>

          <div className="flex justify-center">
            <div className="w-max inline-flex gap-2 overflow-x-auto pb-2 sm:overflow-visible sm:flex-wrap sm:justify-center">
              {Object.entries(gradeLabels).map(([grade, label]) => (
                <Button
                  key={grade}
                  onClick={() => handleGrade(Number(grade) as SuperMemoGrade)}
                  variant="outline"
                  className={`shrink-0 w-[50px] sm:w-[50px] text-left h-auto p-3 ${gradeColors[Number(grade) as keyof typeof gradeColors]
                    } text-white border-none touch-manipulation`}
                  aria-label={`${grade}: ${label}`}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm md:text-base">{grade}</div>
                    {/* <div className="hidden sm:block text-xs opacity-90">{label}</div> */}
                    {/* keep for a11y on mobile */}
                    {/* <span className="sr-only">{label}</span> */}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasAnswered && (
        <div className="text-center">
          <div className="text-green-600 dark:text-green-400 font-medium">✓ Reviewed!</div>
        </div>
      )}
    </div>
  )
}
