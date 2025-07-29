// Debug helper for the store
// Run this in the browser console to debug store state

function debugStore() {
  const store = window.__ZUSTAND_STORE__ || useFlashcardStore?.getState?.()
  
  if (!store) {
    console.log('Store not found. Make sure you have the store accessible.')
    return
  }
  
  console.log('=== STORE DEBUG ===')
  console.log('Decks:', store.decks?.length || 0)
  console.log('Flashcards:', store.flashcards?.length || 0)
  console.log('Selected Deck ID:', store.selectedDeckId)
  
  // Test selectedDeck getter
  try {
    const selectedDeck = store.selectedDeck
    console.log('Selected Deck:', selectedDeck)
    console.log('Selected Deck Name:', selectedDeck?.name)
  } catch (error) {
    console.error('Error getting selectedDeck:', error)
  }
  
  // Debug flashcard dates
  if (store.selectedDeckId && store.flashcards) {
    const now = new Date()
    const deckCards = store.flashcards.filter(card => card.deckId === store.selectedDeckId)
    console.log('=== DECK CARDS DEBUG ===')
    console.log('Total cards in deck:', deckCards.length)
    console.log('Current time:', now.toISOString())
    
    deckCards.forEach((card, index) => {
      const nextReview = new Date(card.nextReview)
      const isDue = nextReview <= now
      console.log(`Card ${index + 1}:`, {
        front: card.front.substring(0, 50) + '...',
        nextReview: nextReview.toISOString(),
        isDue,
        timeDiff: nextReview.getTime() - now.getTime()
      })
    })
  }
  
  // Test reviewCards getter
  try {
    const reviewCards = store.reviewCards
    console.log('Review Cards:', reviewCards?.length || 0)
    if (reviewCards && reviewCards.length > 0) {
      console.log('First review card:', reviewCards[0].front.substring(0, 50) + '...')
    }
  } catch (error) {
    console.error('Error getting reviewCards:', error)
  }
  
  // Test currentCard getter
  try {
    const currentCard = store.currentCard
    console.log('Current Card:', currentCard ? 'Found' : 'None')
    if (currentCard) {
      console.log('Current card front:', currentCard.front.substring(0, 50) + '...')
    }
  } catch (error) {
    console.error('Error getting currentCard:', error)
  }
  
  // Manual deck lookup
  if (store.selectedDeckId && store.decks) {
    const manualDeck = store.decks.find(d => d.id === store.selectedDeckId)
    console.log('Manual Deck Lookup:', manualDeck?.name || 'Not found')
  }
  
  console.log('=== END DEBUG ===')
  
  return {
    decks: store.decks,
    flashcards: store.flashcards,
    selectedDeckId: store.selectedDeckId,
    selectedDeck: store.selectedDeck,
    reviewCards: store.reviewCards,
    currentCard: store.currentCard
  }
}

// Function to clear localStorage and reinitialize
function clearAndReinitialize() {
  console.log('Clearing localStorage and reinitializing...')
  localStorage.removeItem('flashcard-store')
  location.reload()
}

// Make functions available globally
window.debugStore = debugStore
window.clearAndReinitialize = clearAndReinitialize

console.log('Debug functions loaded:')
console.log('- debugStore() - Debug current store state')
console.log('- clearAndReinitialize() - Clear localStorage and reload')