import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Flashcard, Deck } from '@/types/flashcard'
import type { SuperMemoGrade } from 'supermemo'
import {
  createFlashcard,
  createDeck,
  reviewFlashcard,
  getDueFlashcards,
  getFlashcardsByDeck,
  getDeckStats,
  getOverallStats,
} from '@/utils/flashcard-utils'
import { generateSampleData } from '@/utils/sample-data'

interface FlashcardState {
  // state
  flashcards: Flashcard[]
  decks: Deck[]
  selectedDeckId: string | null
  currentCardIndex: number
  cramMode: boolean
  cramSessionStats: {
    cardsReviewed: number
    correctAnswers: number
    sessionStartTime: Date
    totalCards: number
  }
  reviewedCardIds: Set<string>
  isOnline: boolean
  lastSync: Date | null
  isSyncing: boolean
  syncError: string | null

  // setters
  setFlashcards: (flashcards: Flashcard[]) => void
  setDecks: (decks: Deck[]) => void
  setSelectedDeckId: (deckId: string | null) => void
  setCurrentCardIndex: (index: number) => void
  setCramMode: (mode: boolean) => void
  setCramSessionStats: (stats: FlashcardState['cramSessionStats']) => void
  setReviewedCardIds: (ids: Set<string>) => void
  setSyncStatus: (status: { isOnline: boolean; lastSync: Date | null; isSyncing: boolean; error: string | null }) => void

  // deck actions
  addDeck: (name: string, description?: string) => string
  deleteDeck: (deckId: string) => void
  updateDeck: (deckId: string, updates: Partial<Deck>) => void

  // flashcard actions
  addFlashcard: (front: string, back: string, frontLanguage?: string, backLanguage?: string, deckId?: string) => void
  editFlashcard: (cardId: string, front: string, back: string, frontLanguage?: string, backLanguage?: string) => void
  deleteFlashcard: (cardId: string) => void
  reviewCard: (cardId: string, grade: SuperMemoGrade) => void
  reviewCardInCramMode: (cardId: string, grade: SuperMemoGrade) => void

  // navigation
  nextCard: () => void
  previousCard: () => void
  resetSession: () => void
  selectDeck: (deckId: string) => void
  toggleCramMode: () => void
  resetCramSession: () => void

  // import/export
  importData: (importDecks: Deck[], importFlashcards: Flashcard[]) => void

  // init
  initializeWithSampleData: () => void

  // derived (memoized)
  selectedDeck: Deck | undefined
  dueCards: Flashcard[]
  cramCards: Flashcard[]
  reviewCards: Flashcard[]
  currentCard: Flashcard | undefined
  deckStats: ReturnType<typeof getDeckStats> | null
  overallStats: ReturnType<typeof getOverallStats>
  canGoPrevious: boolean
  canGoNext: boolean
}

// Simplified store without caching for better reliability

export const useFlashcardStore = create<FlashcardState>()(
  devtools(
    persist(
      (set, get) => ({
      // initial state
      flashcards: [],
      decks: [],
      selectedDeckId: null,
      currentCardIndex: 0,
      cramMode: false,
      cramSessionStats: {
        cardsReviewed: 0,
        correctAnswers: 0,
        sessionStartTime: new Date(),
        totalCards: 0,
      },
      reviewedCardIds: new Set(),
      isOnline: false,
      lastSync: null,
      isSyncing: false,
      syncError: null,

      // setters
      setFlashcards: (flashcards) => set({ flashcards }),
      setDecks: (decks) => set({ decks }),
      setSelectedDeckId: (selectedDeckId) => set({ selectedDeckId }),
      setCurrentCardIndex: (currentCardIndex) => set({ currentCardIndex }),
      setCramMode: (cramMode) => set({ cramMode }),
      setCramSessionStats: (cramSessionStats) => set({ cramSessionStats }),
      setReviewedCardIds: (reviewedCardIds) => set({ reviewedCardIds }),
      setSyncStatus: ({ isOnline, lastSync, isSyncing, error }) =>
        set({ isOnline, lastSync, isSyncing, syncError: error }),

      // deck actions
      addDeck: (name, description) => {
        const newDeck = createDeck(name, description)
        set((state) => ({ decks: [...state.decks, newDeck] }))
        return newDeck.id
      },

      deleteDeck: (deckId) => {
        set((state) => {
          const newFlashcards = state.flashcards.filter((c) => c.deckId !== deckId)
          const newDecks = state.decks.filter((d) => d.id !== deckId)
          const newSelectedDeckId = state.selectedDeckId === deckId
            ? (newDecks[0]?.id ?? null)
            : state.selectedDeckId
          return {
            flashcards: newFlashcards,
            decks: newDecks,
            selectedDeckId: newSelectedDeckId,
            currentCardIndex: 0,
          }
        })
      },

      updateDeck: (deckId, updates) => {
        set((state) => ({
          decks: state.decks.map((d) => (d.id === deckId ? { ...d, ...updates } : d)),
        }))
      },

      // flashcard actions
      addFlashcard: (front, back, frontLanguage, backLanguage, deckId) => {
        const state = get()
        const targetDeckId = deckId || state.selectedDeckId
        if (!targetDeckId) return
        const newCard = createFlashcard(front, back, targetDeckId, frontLanguage, backLanguage)
        set((s) => ({ flashcards: [...s.flashcards, newCard] }))
      },

      editFlashcard: (cardId, front, back, frontLanguage, backLanguage) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  front: front.trim(),
                  back: back.trim(),
                  frontLanguage,
                  backLanguage,
                }
              : card
          ),
        }))
      },

      deleteFlashcard: (cardId) => {
        set((state) => ({
          flashcards: state.flashcards.filter((c) => c.id !== cardId),
        }))
      },

      reviewCard: (cardId, grade) => {
        set((state) => ({
          flashcards: state.flashcards.map((c) => (c.id === cardId ? reviewFlashcard(c, grade) : c)),
        }))
      },

      // in cram mode we track stats only; scheduling unchanged
      reviewCardInCramMode: (cardId, grade) => {
        set((state) => {
          const reviewed = new Set(state.reviewedCardIds)
          reviewed.add(cardId)
          return {
            reviewedCardIds: reviewed,
            cramSessionStats: {
              ...state.cramSessionStats,
              cardsReviewed: state.cramSessionStats.cardsReviewed + 1,
              correctAnswers: state.cramSessionStats.correctAnswers + (grade >= 3 ? 1 : 0),
            },
          }
        })
      },

      // navigation
      nextCard: () => {
        const state = get()
        const cards = state.cramMode ? state.cramCards : state.dueCards
        if (cards.length === 0) return
        set({ currentCardIndex: (state.currentCardIndex + 1) % cards.length })
      },

      previousCard: () => {
        const state = get()
        const cards = state.cramMode ? state.cramCards : state.dueCards
        if (cards.length === 0) return
        const prev = state.currentCardIndex === 0 ? cards.length - 1 : state.currentCardIndex - 1
        set({ currentCardIndex: prev })
      },

      resetSession: () => set({ currentCardIndex: 0 }),

      selectDeck: (deckId) => {
        console.log('selectDeck called with deckId:', deckId)
        set((state) => {
          const deckCards = getFlashcardsByDeck(state.flashcards, deckId)
          const newState = {
            selectedDeckId: deckId,
            currentCardIndex: 0,
            cramSessionStats: state.cramMode
              ? {
                  cardsReviewed: 0,
                  correctAnswers: 0,
                  sessionStartTime: new Date(),
                  totalCards: deckCards.length,
                }
              : state.cramSessionStats,
            reviewedCardIds: state.cramMode ? new Set() : state.reviewedCardIds,
          }
          console.log('selectDeck setting new state:', newState)
          return newState
        })
        
        // Verify the state was updated
        const updatedState = get()
        console.log('State after selectDeck:', {
          selectedDeckId: updatedState.selectedDeckId,
          selectedDeck: updatedState.selectedDeck?.name,
          reviewCardsCount: updatedState.reviewCards.length
        })
      },

      toggleCramMode: () => {
        set((state) => {
          const newMode = !state.cramMode
          if (newMode && state.selectedDeckId) {
            const deckCards = getFlashcardsByDeck(state.flashcards, state.selectedDeckId)
            return {
              cramMode: newMode,
              currentCardIndex: 0,
              cramSessionStats: {
                cardsReviewed: 0,
                correctAnswers: 0,
                sessionStartTime: new Date(),
                totalCards: deckCards.length,
              },
              reviewedCardIds: new Set(),
            }
          }
          return { cramMode: newMode, currentCardIndex: 0 }
        })
      },

      resetCramSession: () => {
        const state = get()
        if (!state.selectedDeckId) return
        const deckCards = getFlashcardsByDeck(state.flashcards, state.selectedDeckId)
        set({
          cramSessionStats: {
            cardsReviewed: 0,
            correctAnswers: 0,
            sessionStartTime: new Date(),
            totalCards: deckCards.length,
          },
          reviewedCardIds: new Set(),
          currentCardIndex: 0,
        })
      },

      importData: (importDecks, importFlashcards) => {
        set({
          decks: importDecks,
          flashcards: importFlashcards,
          selectedDeckId: importDecks[0]?.id ?? null,
          currentCardIndex: 0,
          cramMode: false,
          reviewedCardIds: new Set(),
          cramSessionStats: {
            cardsReviewed: 0,
            correctAnswers: 0,
            sessionStartTime: new Date(),
            totalCards: 0,
          },
        })
      },

      initializeWithSampleData: () => {
        console.log('initializeWithSampleData called')
        const sample = generateSampleData()
        console.log('Generated sample data:', {
          decksCount: sample.decks.length,
          flashcardsCount: sample.flashcards.length,
          firstDeckId: sample.decks[0]?.id,
          firstDeckName: sample.decks[0]?.name
        })
        
        set({
          decks: sample.decks,
          flashcards: sample.flashcards,
          selectedDeckId: sample.decks[0]?.id ?? null,
          currentCardIndex: 0,
          cramMode: false,
          reviewedCardIds: new Set(),
          cramSessionStats: {
            cardsReviewed: 0,
            correctAnswers: 0,
            sessionStartTime: new Date(),
            totalCards: 0,
          },
        })
        
        // Verify the state was set correctly
        const newState = get()
        console.log('State after initialization:', {
          decksCount: newState.decks.length,
          selectedDeckId: newState.selectedDeckId,
          selectedDeck: newState.selectedDeck?.name
        })
      },

      // ---- derived (computed properties) ----
      get selectedDeck() {
        const state = get()
        // Simplified without caching for now to debug the issue
        return state.decks.find((d) => d.id === state.selectedDeckId)
      },

      get dueCards() {
        const state = get()
        if (!state.selectedDeckId) return []
        
        const now = new Date()
        const allCards = state.flashcards.filter(card => card.deckId === state.selectedDeckId)
        const dueCards = allCards.filter(card => {
          const nextReview = new Date(card.nextReview)
          const isDue = nextReview <= now
          console.log('Card due check:', {
            front: card.front.substring(0, 30) + '...',
            nextReview: nextReview.toISOString(),
            now: now.toISOString(),
            isDue,
            nextReviewType: typeof card.nextReview,
            isDateObject: card.nextReview instanceof Date
          })
          return isDue
        })
        
        console.log(`getDueCards: ${dueCards.length} out of ${allCards.length} cards are due`)
        return dueCards
      },

      get cramCards() {
        const state = get()
        return state.selectedDeckId ? getFlashcardsByDeck(state.flashcards, state.selectedDeckId) : []
      },

      get reviewCards() {
        const state = get()
        const dueCards = state.dueCards // Use the getter to get debug info
        const cramCards = state.selectedDeckId ? getFlashcardsByDeck(state.flashcards, state.selectedDeckId) : []
        const result = state.cramMode ? cramCards : dueCards
        console.log(`reviewCards: returning ${result.length} cards (cramMode: ${state.cramMode})`)
        return result
      },

      get currentCard() {
        const state = get()
        const reviewCards = (() => {
          const dueCards = state.selectedDeckId ? getDueFlashcards(state.flashcards, state.selectedDeckId) : []
          const cramCards = state.selectedDeckId ? getFlashcardsByDeck(state.flashcards, state.selectedDeckId) : []
          return state.cramMode ? cramCards : dueCards
        })()
        return reviewCards.length ? reviewCards[state.currentCardIndex % reviewCards.length] : undefined
      },

      get deckStats() {
        const state = get()
        const deck = state.decks.find((d) => d.id === state.selectedDeckId)
        if (!deck) return null
        return getDeckStats(state.flashcards, deck)
      },

      get overallStats() {
        const state = get()
        return getOverallStats(state.flashcards)
      },

      get canGoPrevious() {
        const state = get()
        const reviewCards = (() => {
          const dueCards = state.selectedDeckId ? getDueFlashcards(state.flashcards, state.selectedDeckId) : []
          const cramCards = state.selectedDeckId ? getFlashcardsByDeck(state.flashcards, state.selectedDeckId) : []
          return state.cramMode ? cramCards : dueCards
        })()
        return reviewCards.length > 1
      },

      get canGoNext() {
        const state = get()
        const reviewCards = (() => {
          const dueCards = state.selectedDeckId ? getDueFlashcards(state.flashcards, state.selectedDeckId) : []
          const cramCards = state.selectedDeckId ? getFlashcardsByDeck(state.flashcards, state.selectedDeckId) : []
          return state.cramMode ? cramCards : dueCards
        })()
        return reviewCards.length > 1
      },
      }),
      {
        name: 'flashcard-store',
        // Only persist essential data, not computed properties
        partialize: (state) => ({
          flashcards: state.flashcards,
          decks: state.decks,
          selectedDeckId: state.selectedDeckId,
          currentCardIndex: state.currentCardIndex,
          cramMode: state.cramMode,
          cramSessionStats: state.cramSessionStats,
          reviewedCardIds: Array.from(state.reviewedCardIds), // Convert Set to Array for serialization
          isOnline: state.isOnline,
          lastSync: state.lastSync,
          isSyncing: state.isSyncing,
          syncError: state.syncError,
        }),
        // Convert Array back to Set when rehydrating and initialize if needed
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Error rehydrating store:', error)
            return
          }
          
          if (state) {
            // Convert Array back to Set
            if (Array.isArray((state as any).reviewedCardIds)) {
              (state as any).reviewedCardIds = new Set((state as any).reviewedCardIds)
            } else if (!(state.reviewedCardIds instanceof Set)) {
              state.reviewedCardIds = new Set()
            }
            
            // Convert date strings back to Date objects
            if (state.flashcards) {
              state.flashcards = state.flashcards.map(card => ({
                ...card,
                createdAt: new Date(card.createdAt),
                lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
                nextReview: new Date(card.nextReview),
              }))
            }
            
            if (state.decks) {
              state.decks = state.decks.map(deck => ({
                ...deck,
                createdAt: new Date(deck.createdAt),
              }))
            }
            
            if (state.cramSessionStats?.sessionStartTime) {
              state.cramSessionStats.sessionStartTime = new Date(state.cramSessionStats.sessionStartTime)
            }
            
            if (state.lastSync) {
              state.lastSync = new Date(state.lastSync)
            }
            
            // Initialize with sample data if store is empty
            if (!state.decks || state.decks.length === 0) {
              console.log('Store is empty after rehydration, initializing with sample data')
              setTimeout(() => {
                useFlashcardStore.getState().initializeWithSampleData()
              }, 100)
            } else {
              console.log('Store rehydrated successfully with', state.decks.length, 'decks')
              console.log('First flashcard nextReview:', state.flashcards[0]?.nextReview, 'is Date:', state.flashcards[0]?.nextReview instanceof Date)
            }
          } else {
            console.log('No persisted state found, will initialize with sample data')
            setTimeout(() => {
              useFlashcardStore.getState().initializeWithSampleData()
            }, 100)
          }
        },
      }
    )
  )
)