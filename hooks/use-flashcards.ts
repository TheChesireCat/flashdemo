"use client"

import { useState, useEffect } from "react"
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

const FLASHCARDS_STORAGE_KEY = "flashcards"
const DECKS_STORAGE_KEY = "decks"

export function useFlashcards() {
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

  // Load data from localStorage on mount
  useEffect(() => {
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
  }, [])

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

  const addDeck = (name: string, description?: string) => {
    const newDeck = createDeck(name, description)
    setDecks((prev) => [...prev, newDeck])
    return newDeck.id
  }

  const deleteDeck = (deckId: string) => {
    // Delete all flashcards in the deck
    setFlashcards((prev) => prev.filter((card) => card.deckId !== deckId))
    // Delete the deck
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
    // Select another deck if the current one was deleted
    if (selectedDeckId === deckId) {
      const remainingDecks = decks.filter((deck) => deck.id !== deckId)
      setSelectedDeckId(remainingDecks.length > 0 ? remainingDecks[0].id : null)
    }
  }

  const addFlashcard = (
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
  }

  const editFlashcard = (
    cardId: string,
    front: string,
    back: string,
    frontLanguage?: string,
    backLanguage?: string,
  ) => {
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              front: front.trim(),
              back: back.trim(),
              frontLanguage,
              backLanguage,
            }
          : card,
      ),
    )
  }

  const importData = (importDecks: Deck[], importFlashcards: Flashcard[]) => {
    setDecks(importDecks)
    setFlashcards(importFlashcards)

    // Select the first imported deck if no deck is currently selected
    if (!selectedDeckId && importDecks.length > 0) {
      setSelectedDeckId(importDecks[0].id)
    }
  }

  const reviewCard = (cardId: string, grade: SuperMemoGrade) => {
    setFlashcards((prev) => prev.map((card) => (card.id === cardId ? reviewFlashcard(card, grade) : card)))
  }

  const deleteCard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const getAllCardsForCramReview = (deckId: string) => {
    return getFlashcardsByDeck(flashcards, deckId)
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
        // In cram mode, if we've cycled through all cards, we can continue cycling
        // In regular mode, we just cycle through due cards
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
  }
}
