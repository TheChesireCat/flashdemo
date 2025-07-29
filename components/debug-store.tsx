"use client"

import { useFlashcardStore } from "@/stores/flashcard-store"

export function DebugStore() {
  const {
    decks,
    flashcards,
    selectedDeckId,
    selectedDeck,
    reviewCards,
    currentCard,
    initializeWithSampleData
  } = useFlashcardStore()

  const handleInitialize = () => {
    console.log('Manual initialization triggered')
    initializeWithSampleData()
  }

  const handleSelectFirst = () => {
    if (decks.length > 0) {
      console.log('Manually selecting first deck:', decks[0].id)
      useFlashcardStore.getState().selectDeck(decks[0].id)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Debug Store</h3>
      <div className="text-xs space-y-1">
        <div>Decks: {decks.length}</div>
        <div>Flashcards: {flashcards.length}</div>
        <div>Selected Deck ID: {selectedDeckId || 'null'}</div>
        <div>Selected Deck Name: {selectedDeck?.name || 'undefined'}</div>
        <div>Review Cards: {reviewCards.length}</div>
        <div>Current Card: {currentCard?.front.substring(0, 30) || 'undefined'}</div>
      </div>
      <div className="mt-2 space-y-1">
        <button 
          onClick={handleInitialize}
          className="block w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Initialize Sample Data
        </button>
        <button 
          onClick={handleSelectFirst}
          className="block w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Select First Deck
        </button>
      </div>
    </div>
  )
}