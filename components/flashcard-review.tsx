"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeDisplay } from "@/components/code-display"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { Flashcard } from "@/types/flashcard"
import type { SuperMemoGrade } from "supermemo"

interface FlashcardReviewProps {
  card: Flashcard
  onReview: (grade: SuperMemoGrade) => void
  onNext: () => void
  onPrevious: () => void
  cardNumber: number
  totalCards: number
  isCramMode?: boolean
  cramSessionStats?: {
    cardsReviewed: number
    correctAnswers: number
    reviewedCardIds: Set<string>
  }
  canGoPrevious: boolean
  canGoNext: boolean
}

const GRADES: { value: SuperMemoGrade; label: string; description: string; color: string }[] = [
  { value: 1, label: "Again", description: "Complete blackout", color: "bg-red-500 hover:bg-red-600" },
  { value: 2, label: "Hard", description: "Correct response recalled with serious difficulty", color: "bg-orange-500 hover:bg-orange-600" },
  { value: 3, label: "Good", description: "Correct response with some difficulty", color: "bg-yellow-500 hover:bg-yellow-600" },
  { value: 4, label: "Easy", description: "Correct response with little difficulty", color: "bg-green-500 hover:bg-green-600" },
  { value: 5, label: "Perfect", description: "Perfect response with no difficulty", color: "bg-blue-500 hover:bg-blue-600" },
]

export function FlashcardReview({
  card,
  onReview,
  onNext,
  onPrevious,
  cardNumber,
  totalCards,
  isCramMode = false,
  cramSessionStats,
  canGoPrevious,
  canGoNext,
}: FlashcardReviewProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<SuperMemoGrade | null>(null)

  const handleGradeSelect = (grade: SuperMemoGrade) => {
    setSelectedGrade(grade)
    onReview(grade)
    
    // Auto-advance after a short delay
    setTimeout(() => {
      setShowAnswer(false)
      setSelectedGrade(null)
      onNext()
    }, 1000)
  }

  const handleNext = () => {
    setShowAnswer(false)
    setSelectedGrade(null)
    onNext()
  }

  const handlePrevious = () => {
    setShowAnswer(false)
    setSelectedGrade(null)
    onPrevious()
  }

  const isReviewed = cramSessionStats?.reviewedCardIds.has(card.id)

  return (
    <div className="space-y-4">
      {/* Card Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Card {cardNumber} of {totalCards}
          {isCramMode && (
            <span className="ml-2">
              ({cramSessionStats?.cardsReviewed || 0} reviewed)
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Flashcard */}
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isCramMode ? "Cram Mode" : "Review"}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isCramMode && isReviewed && (
                <Badge variant="secondary" className="text-xs">
                  Reviewed
                </Badge>
              )}
              {card.frontLanguage && (
                <Badge variant="outline" className="text-xs">
                  {card.frontLanguage}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Front Content */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Front</h3>
              <div className="min-h-[120px] p-4 border rounded-lg bg-muted/50">
                {card.frontLanguage ? (
                  <CodeDisplay
                    code={card.front}
                    language={card.frontLanguage}
                    className="text-sm"
                  />
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: card.front }}
                  />
                )}
              </div>
            </div>

            {/* Answer Section */}
            {showAnswer && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Back</h3>
                  <div className="min-h-[120px] p-4 border rounded-lg bg-muted/50">
                    {card.backLanguage ? (
                      <CodeDisplay
                        code={card.back}
                        language={card.backLanguage}
                        className="text-sm"
                      />
                    ) : (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: card.back }}
                      />
                    )}
                  </div>
                </div>

                {/* Grade Buttons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">How well did you know this?</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {GRADES.map((grade) => (
                      <Button
                        key={grade.value}
                        variant="outline"
                        className={`justify-start h-auto p-3 ${grade.color} text-white border-0`}
                        onClick={() => handleGradeSelect(grade.value)}
                        disabled={selectedGrade !== null}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: grade.value }, (_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{grade.label}</div>
                            <div className="text-xs opacity-90">{grade.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Show Answer Button */}
            {!showAnswer && (
              <Button
                onClick={() => setShowAnswer(true)}
                className="w-full"
                size="lg"
              >
                Show Answer
              </Button>
            )}
          </div>

          {/* Card Stats */}
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>E-factor: {card.efactor.toFixed(2)}</span>
              <span>Interval: {card.interval} days</span>
              <span>Repetitions: {card.repetition}</span>
            </div>
            {card.lastReviewed && (
              <div className="text-center mt-1">
                Last reviewed: {new Date(card.lastReviewed).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Card
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex items-center gap-1"
        >
          Next Card
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}