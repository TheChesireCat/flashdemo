"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, BookOpen, BarChart3, Code, Edit, Trash2 } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useFlashcards } from "./hooks/use-flashcards"
import { AppSidebar } from "./components/app-sidebar"
import { AddFlashcardForm } from "./components/add-flashcard-form"
import { EditFlashcardForm } from "./components/edit-flashcard-form"
import { FlashcardReview } from "./components/flashcard-review"
import { StatsDashboard } from "./components/stats-dashboard"
import { ImportExportDialog } from "./components/import-export-dialog"
import { CodeDisplay } from "./components/code-display"
import { ThemeToggle } from "./components/theme-toggle"
import { CramModeToggle } from "./components/cram-mode-toggle"
import { CramSessionStats } from "./components/cram-session-stats"

const TAB_CONTENT_CLS = "space-y-4 min-w-0 w-full max-w-full overflow-x-hidden"
const INNER_CONTAINER_CLS = "mx-auto w-full min-w-0 max-w-5xl"

export default function FlashcardApp() {
  const {
    flashcards,
    decks,
    selectedDeck,
    selectedDeckId,
    reviewCards,
    currentCard,
    currentCardIndex,
    deckStats,
    cramMode,
    cramSessionStats,
    reviewedCardIds,
    addDeck,
    deleteDeck,
    addFlashcard,
    editFlashcard,
    importData,
    reviewCard,
    reviewCardInCramMode,
    deleteCard,
    nextCard,
    selectDeck,
    toggleCramMode,
    resetCramSession,
    getFlashcardsByDeck,
    getDeckStats,
  } = useFlashcards()

  const [activeTab, setActiveTab] = useState("review")
  const [showHtmlInManage, setShowHtmlInManage] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const handleReview = (grade: any) => {
    if (currentCard) {
      if (cramMode) {
        reviewCardInCramMode(currentCard.id, grade)
      } else {
        reviewCard(currentCard.id, grade)
      }
    }
  }

  const handleEditCard = (
    cardId: string,
    front: string,
    back: string,
    frontLanguage?: string,
    backLanguage?: string,
  ) => {
    editFlashcard(cardId, front, back, frontLanguage, backLanguage)
    setEditingCardId(null)
  }

  const selectedDeckCards = selectedDeckId ? getFlashcardsByDeck(selectedDeckId) : []
  const editingCard = editingCardId ? flashcards.find((card) => card.id === editingCardId) : null

  return (
    <SidebarProvider>
      <AppSidebar
        decks={decks}
        selectedDeckId={selectedDeckId}
        onSelectDeck={selectDeck}
        onAddDeck={addDeck}
        onDeleteDeck={deleteDeck}
        getDeckStats={getDeckStats}
      />

      <SidebarInset className="flex-1 min-w-0 overflow-x-hidden">
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-3 md:px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-semibold truncate">
                  {selectedDeck ? selectedDeck.name : "L337Deck"}
                </h1>
                {selectedDeck?.description && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                    {selectedDeck.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <ImportExportDialog
                  decks={decks}
                  flashcards={flashcards}
                  selectedDeck={selectedDeck}
                  onImport={importData}
                />
              </div>
            </header>

            <div className="p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
              {deckStats && <StatsDashboard stats={deckStats} />}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
                <TabsList className="grid w-full grid-cols-3 h-10 md:h-auto">
                  <TabsTrigger value="review" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Review</span>
                    <span className="xs:hidden">({reviewCards.length})</span>
                    <span className="hidden xs:inline">({reviewCards.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="add" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Add</span>
                    <span className="xs:hidden">+</span>
                  </TabsTrigger>
                  <TabsTrigger value="manage" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden xs:inline">Manage</span>
                    <span className="xs:hidden">⚙</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="review" className={TAB_CONTENT_CLS}>
                  <div className={INNER_CONTAINER_CLS}>
                    {/* Cram Mode Toggle - only show when deck is selected */}
                    {selectedDeck && (
                      <div className="flex justify-center">
                        <CramModeToggle
                          isCramMode={cramMode}
                          onToggle={toggleCramMode}
                          disabled={selectedDeckCards.length === 0}
                        />
                      </div>
                    )}

                    {/* Cram Session Stats - only show when in cram mode */}
                    {cramMode && selectedDeck && (
                      <CramSessionStats
                        sessionStats={{
                          ...cramSessionStats,
                          reviewedCardIds,
                        }}
                        onResetSession={resetCramSession}
                        showResetButton={true}
                      />
                    )}

                    {!selectedDeck ? (
                      <Card>
                        <CardContent className="text-center py-8 md:py-12">
                          <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="text-base md:text-lg font-medium mb-2">No deck selected</h3>
                          <p className="text-sm md:text-base text-muted-foreground">
                            Please select a deck from the sidebar to start reviewing.
                          </p>
                        </CardContent>
                      </Card>
                    ) : reviewCards.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8 md:py-12">
                          <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="text-base md:text-lg font-medium mb-2">
                            {cramMode ? "No cards in this deck!" : "No cards due for review!"}
                          </h3>
                          <p className="text-sm md:text-base text-muted-foreground mb-4">
                            {selectedDeckCards.length === 0
                              ? "Add some flashcards to get started."
                              : cramMode
                                ? "This deck is empty."
                                : "Great job! Check back later for more reviews or try cram mode to review all cards."}
                          </p>
                          {selectedDeckCards.length === 0 && (
                            <Button onClick={() => setActiveTab("add")} size="sm" className="md:size-default">
                              Add Your First Card
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ) : currentCard ? (
                      <FlashcardReview
                        card={currentCard}
                        onReview={handleReview}
                        onNext={nextCard}
                        cardNumber={currentCardIndex + 1}
                        totalCards={reviewCards.length}
                        isCramMode={cramMode}
                        cramSessionStats={cramMode ? { ...cramSessionStats, reviewedCardIds } : undefined}
                      />
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8 md:py-12">
                          <p className="text-muted-foreground">Loading card...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="add" className={TAB_CONTENT_CLS}>
                  <div className={INNER_CONTAINER_CLS}>
                    <AddFlashcardForm selectedDeck={selectedDeck} onAdd={addFlashcard} />
                  </div>
                </TabsContent>

                <TabsContent value="manage" className={TAB_CONTENT_CLS}>
                  <div className={INNER_CONTAINER_CLS}>
                    {/* Show edit form if editing */}
                    {editingCard && selectedDeck && (
                      <EditFlashcardForm
                        card={editingCard}
                        deck={selectedDeck}
                        onSave={(front, back, frontLanguage, backLanguage) =>
                          handleEditCard(editingCard.id, front, back, frontLanguage, backLanguage)
                        }
                        onCancel={() => setEditingCardId(null)}
                      />
                    )}

                    <Card>
                      <CardHeader className="min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                          <CardTitle className="text-base md:text-lg min-w-0 truncate">
                            {selectedDeck ? `${selectedDeck.name} Cards` : "All Cards"} ({selectedDeckCards.length})
                          </CardTitle>
                          <div className="flex flex-col xs:flex-row gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowHtmlInManage(!showHtmlInManage)}
                              className="text-xs"
                            >
                              <Code className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              {showHtmlInManage ? "Rendered" : "HTML"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-8 overflow-x-hidden min-w-0">
                        {selectedDeckCards.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4 text-sm md:text-base">
                            {selectedDeck ? "No flashcards in this deck yet." : "No deck selected."}
                          </p>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="space-y-4">
                              {selectedDeckCards.map((card) => (
                                <div
                                  key={card.id}
                                  className={`p-3 md:p-4 border rounded-lg transition-colors min-w-0 ${editingCardId === card.id ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" : "bg-card"
                                    }`}
                                >
                                  <div className="space-y-4 min-w-0">
                                    {/* Front Content */}
                                    <div>
                                      <div className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                        Front {card.frontLanguage && (
                                          <Badge variant="outline" className="text-xs ml-2">
                                            {card.frontLanguage}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-base md:text-xl leading-relaxed min-h-[100px] w-full min-w-0 text-left">
                                        {showHtmlInManage ? (
                                          <pre className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs md:text-sm bg-muted p-3 md:p-4 rounded-md font-mono text-left dark:bg-muted dark:text-foreground">
                                            {card.front}
                                          </pre>
                                        ) : card.frontLanguage ? (
                                          <div className="w-full max-w-full overflow-x-auto min-w-0">
                                            <CodeDisplay
                                              code={card.front}
                                              language={card.frontLanguage}
                                              className="w-full max-w-full text-left"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full max-w-full overflow-x-auto min-w-0">
                                            <div
                                              className="prose prose-sm md:prose-lg max-w-none text-sm md:text-base dark:prose-invert break-words [overflow-wrap:anywhere] text-left"
                                              dangerouslySetInnerHTML={{ __html: card.front }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Back Content */}
                                    <div>
                                      <div className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                        Back {card.backLanguage && (
                                          <Badge variant="outline" className="text-xs ml-2">
                                            {card.backLanguage}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-base md:text-xl leading-relaxed min-h-[100px] w-full min-w-0 text-left">
                                        {showHtmlInManage ? (
                                          <pre className="w-full max-w-full overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs md:text-sm bg-muted p-3 md:p-4 rounded-md font-mono text-left dark:bg-muted dark:text-foreground">
                                            {card.back}
                                          </pre>
                                        ) : card.backLanguage ? (
                                          <div className="w-full max-w-full overflow-x-auto min-w-0">
                                            <CodeDisplay
                                              code={card.back}
                                              language={card.backLanguage}
                                              className="w-full max-w-full text-left"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-full max-w-full overflow-x-auto min-w-0">
                                            <div
                                              className="prose prose-sm md:prose-lg max-w-none text-sm md:text-base dark:prose-invert break-words [overflow-wrap:anywhere] text-left"
                                              dangerouslySetInnerHTML={{ __html: card.back }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Card Stats */}
                                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                                      E-factor: {card.efactor.toFixed(2)} | Interval: {card.interval} days | Repetitions: {card.repetition}
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2 border-t shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingCardId(card.id)}
                                      disabled={editingCardId !== null}
                                      className="flex-1"
                                    >
                                      <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deleteCard(card.id)}
                                      disabled={editingCardId !== null}
                                      className="flex-1"
                                    >
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
