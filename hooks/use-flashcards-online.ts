"use client"

import { useState, useEffect, useCallback } from "react"
import type { Flashcard, Deck } from "../types/flashcard"
import {
  createFlashcard,
  createDeck,
  reviewFlashcard,
  getDueFlashcards,
  getFlashcardsByDeck,
  getDeckStats,
  getOverallStats,
} from "../utils/flashcard-utils"
import type { SuperMemoGrade } from "supermemo"
import { useAuth } from "@/contexts/auth-context"
import { DatabaseService } from "@/lib/database-service"

const FLASHCARDS_STORAGE_KEY = "flashcards"
const DECKS_STORAGE_KEY = "decks"
const LAST_SYNC_KEY = "last_sync"

interface SyncStatus {
  isOnline: boolean
  lastSync: Date | null
  isSyncing: boolean
  error: string | null
}

export function useFlashcardsOnline() {
  const { user, loading: authLoading } = useAuth()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cramMode, setCramMode] = useState(false)
  const [cramSessionStats, setCramSessionStats] = useState({
    cardsReviewed: 0,
    correctAnswers: 0,
    sessionStartTime: new Date(),
    totalCards: 0,
  })
  const [reviewedCardIds, setReviewedCardIds] = useState<Set<string>>(new Set())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    isSyncing: false,
    error: null,
  })

  // Load data from localStorage on mount
  useEffect(() => {
    if (authLoading) return

    // Load flashcards
    const storedFlashcards = localStorage.getItem(FLASHCARDS_STORAGE_KEY)
    if (storedFlashcards) {
      try {
        const parsed = JSON.parse(storedFlashcards)
        const flashcards = parsed.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          nextReview: new Date(card.nextReview),
        }))
        setFlashcards(flashcards)
      } catch (error) {
        console.error("Failed to load flashcards:", error)
      }
    }

    // Load decks
    const storedDecks = localStorage.getItem(DECKS_STORAGE_KEY)
    if (storedDecks) {
      try {
        const parsed = JSON.parse(storedDecks)
        const decks = parsed.map((deck: any) => ({
          ...deck,
          createdAt: new Date(deck.createdAt),
        }))
        setDecks(decks)
        if (decks.length > 0 && !selectedDeckId) {
          setSelectedDeckId(decks[0].id)
        }
      } catch (error) {
        console.error("Failed to load decks:", error)
      }
    } else {
      // Create a default deck if none exist
      const defaultDeck = createDeck("General", "Default deck for flashcards")
      setDecks([defaultDeck])
      setSelectedDeckId(defaultDeck.id)
    }

    // Load last sync time
    const lastSync = localStorage.getItem(LAST_SYNC_KEY)
    if (lastSync) {
      setSyncStatus(prev => ({ ...prev, lastSync: new Date(lastSync) }))
    }
  }, [authLoading, selectedDeckId])

  // Sync with database when user is authenticated
  useEffect(() => {
    if (!user || authLoading) {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
      return
    }

    setSyncStatus(prev => ({ ...prev, isOnline: true }))
    syncWithDatabase()
  }, [user, authLoading])

  // Save data to localStorage whenever they change
  useEffect(() => {
    if (flashcards.length >= 0) {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards))
    }
  }, [flashcards])

  useEffect(() => {
    if (decks.length > 0) {
      localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks))
    }
  }, [decks])

  const syncWithDatabase = useCallback(async () => {
    if (!user) return

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Load data from database
      const [dbDecks, dbFlashcards] = await Promise.all([
        DatabaseService.getDecks(user.id),
        DatabaseService.getFlashcards(user.id),
      ])

      // Merge with local data (simple strategy - database wins on conflicts)
      const mergedDecks = mergeDecks(decks, dbDecks)
      const mergedFlashcards = mergeFlashcards(flashcards, dbFlashcards)

      setDecks(mergedDecks)
      setFlashcards(mergedFlashcards)

      // Update last sync time
      const now = new Date()
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString())
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: now, 
        isSyncing: false 
      }))

      // Save merged data back to database
      await DatabaseService.syncData(user.id, mergedDecks, mergedFlashcards)

    } catch (error) {
      console.error("Sync failed:", error)
      setSyncStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Sync failed",
        isSyncing: false 
      }))
    }
  }, [user, decks, flashcards])

  const mergeDecks = (localDecks: Deck[], dbDecks: Deck[]): Deck[] => {
    const merged = new Map<string, Deck>()
    
    // Add local decks
    localDecks.forEach(deck => merged.set(deck.id, deck))
    
    // Add/update with database decks (database wins on conflicts)
    dbDecks.forEach(deck => merged.set(deck.id, deck))
    
    return Array.from(merged.values())
  }

  const mergeFlashcards = (localFlashcards: Flashcard[], dbFlashcards: Flashcard[]): Flashcard[] => {
    const merged = new Map<string, Flashcard>()
    
    // Add local flashcards
    localFlashcards.forEach(card => merged.set(card.id, card))
    
    // Add/update with database flashcards (database wins on conflicts)
    dbFlashcards.forEach(card => merged.set(card.id, card))
    
    return Array.from(merged.values())
  }

  const addDeck = async (name: string, description?: string) => {
    const newDeck = createDeck(name, description)
    setDecks((prev) => [...prev, newDeck])

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.createDeck(newDeck, user.id)
      } catch (error) {
        console.error("Failed to sync deck creation:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync deck creation" 
        }))
      }
    }

    return newDeck.id
  }

  const deleteDeck = async (deckId: string) => {
    // Delete all flashcards in the deck
    setFlashcards((prev) => prev.filter((card) => card.deckId !== deckId))
    // Delete the deck
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
    
    // Select another deck if the current one was deleted
    if (selectedDeckId === deckId) {
      const remainingDecks = decks.filter((deck) => deck.id !== deckId)
      setSelectedDeckId(remainingDecks.length > 0 ? remainingDecks[0].id : null)
    }

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.deleteDeck(deckId, user.id)
        // Also delete flashcards in database
        const deckFlashcards = flashcards.filter(card => card.deckId === deckId)
        await Promise.all(
          deckFlashcards.map(card => DatabaseService.deleteFlashcard(card.id, user.id))
        )
      } catch (error) {
        console.error("Failed to sync deck deletion:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync deck deletion" 
        }))
      }
    }
  }

  const addFlashcard = async (
    front: string,
    back: string,
    frontLanguage?: string,
    backLanguage?: string,
    deckId?: string,
  ) => {
    const targetDeckId = deckId || selectedDeckId
    if (!targetDeckId) return

    const newCard = createFlashcard(front, back, targetDeckId, frontLanguage, backLanguage)
    setFlashcards((prev) => [...prev, newCard])

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.createFlashcard(newCard, user.id)
      } catch (error) {
        console.error("Failed to sync flashcard creation:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync flashcard creation" 
        }))
      }
    }
  }

  const editFlashcard = async (
    cardId: string,
    front: string,
    back: string,
    frontLanguage?: string,
    backLanguage?: string,
  ) => {
    const updatedCard = {
      ...flashcards.find(card => card.id === cardId)!,
      front: front.trim(),
      back: back.trim(),
      frontLanguage,
      backLanguage,
    }

    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === cardId ? updatedCard : card,
      ),
    )

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.updateFlashcard(updatedCard, user.id)
      } catch (error) {
        console.error("Failed to sync flashcard update:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync flashcard update" 
        }))
      }
    }
  }

  const reviewCard = async (cardId: string, grade: SuperMemoGrade) => {
    const updatedCard = reviewFlashcard(
      flashcards.find(card => card.id === cardId)!,
      grade
    )

    setFlashcards((prev) => prev.map((card) => (card.id === cardId ? updatedCard : card)))

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.updateFlashcard(updatedCard, user.id)
      } catch (error) {
        console.error("Failed to sync card review:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync card review" 
        }))
      }
    }
  }

  const deleteCard = async (cardId: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== cardId))

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.deleteFlashcard(cardId, user.id)
      } catch (error) {
        console.error("Failed to sync card deletion:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync card deletion" 
        }))
      }
    }
  }

  const importData = async (importDecks: Deck[], importFlashcards: Flashcard[]) => {
    setDecks(importDecks)
    setFlashcards(importFlashcards)

    // Select the first imported deck if no deck is currently selected
    if (!selectedDeckId && importDecks.length > 0) {
      setSelectedDeckId(importDecks[0].id)
    }

    // Sync to database if authenticated
    if (user) {
      try {
        await DatabaseService.syncData(user.id, importDecks, importFlashcards)
      } catch (error) {
        console.error("Failed to sync imported data:", error)
        setSyncStatus(prev => ({ 
          ...prev, 
          error: "Failed to sync imported data" 
        }))
      }
    }
  }

  const reviewCardInCramMode = (cardId: string, grade: SuperMemoGrade) => {
    // Track session performance but don't modify card's SuperMemo intervals
    setReviewedCardIds((prev) => new Set(prev).add(cardId))
    setCramSessionStats((prev) => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      correctAnswers: prev.correctAnswers + (grade >= 3 ? 1 : 0), // Grade 3+ considered correct
    }))
  }

  const getAllCardsForCramReview = (deckId: string) => {
    return getFlashcardsByDeck(flashcards, deckId)
  }

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId)
  const dueCards = selectedDeckId ? getDueFlashcards(flashcards, selectedDeckId) : []
  const cramCards = selectedDeckId ? getAllCardsForCramReview(selectedDeckId) : []
  const reviewCards = cramMode ? cramCards : dueCards
  const currentCard = reviewCards[currentCardIndex]
  const deckStats = selectedDeck ? getDeckStats(flashcards, selectedDeck) : null
  const overallStats = getOverallStats(flashcards)

  const nextCard = () => {
    const cards = cramMode ? cramCards : dueCards
    if (cards.length > 0) {
      setCurrentCardIndex((prev) => {
        const nextIndex = (prev + 1) % cards.length
        return nextIndex
      })
    } else {
      setCurrentCardIndex(0)
    }
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
  }

  const selectDeck = (deckId: string) => {
    setSelectedDeckId(deckId)
    setCurrentCardIndex(0)
    // Reset cram session stats when switching decks
    if (cramMode) {
      const deckCards = getFlashcardsByDeck(flashcards, deckId)
      setCramSessionStats({
        cardsReviewed: 0,
        correctAnswers: 0,
        sessionStartTime: new Date(),
        totalCards: deckCards.length,
      })
      setReviewedCardIds(new Set())
    }
  }

  const toggleCramMode = () => {
    setCramMode((prev) => {
      const newCramMode = !prev
      if (newCramMode && selectedDeckId) {
        // Reset cram session stats when entering cram mode
        const deckCards = getFlashcardsByDeck(flashcards, selectedDeckId)
        setCramSessionStats({
          cardsReviewed: 0,
          correctAnswers: 0,
          sessionStartTime: new Date(),
          totalCards: deckCards.length,
        })
        setReviewedCardIds(new Set())
      }
      // Reset card index when switching modes to ensure proper card selection
      setCurrentCardIndex(0)
      return newCramMode
    })
  }

  const resetCramSession = () => {
    if (selectedDeckId) {
      const deckCards = getFlashcardsByDeck(flashcards, selectedDeckId)
      setCramSessionStats({
        cardsReviewed: 0,
        correctAnswers: 0,
        sessionStartTime: new Date(),
        totalCards: deckCards.length,
      })
      setReviewedCardIds(new Set())
      setCurrentCardIndex(0)
    }
  }

  return {
    flashcards,
    decks,
    selectedDeck,
    selectedDeckId,
    dueCards,
    cramCards,
    reviewCards,
    currentCard,
    currentCardIndex,
    deckStats,
    overallStats,
    cramMode,
    cramSessionStats,
    reviewedCardIds,
    syncStatus,
    addDeck,
    deleteDeck,
    addFlashcard,
    editFlashcard,
    importData,
    reviewCard,
    deleteCard,
    nextCard,
    resetSession,
    selectDeck,
    toggleCramMode,
    resetCramSession,
    getAllCardsForCramReview,
    reviewCardInCramMode,
    getFlashcardsByDeck: (deckId: string) => getFlashcardsByDeck(flashcards, deckId),
    getDeckStats: (deck: Deck) => getDeckStats(flashcards, deck),
    syncWithDatabase,
  }
} 