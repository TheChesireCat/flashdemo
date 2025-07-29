import { supermemo, type SuperMemoItem, type SuperMemoGrade } from "supermemo"
import type { Flashcard, Deck, DeckStats } from "../types/flashcard"

export function createDeck(name: string, description?: string): Deck {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-indigo-500"]
  return {
    id: crypto.randomUUID(),
    name,
    description,
    color: colors[Math.floor(Math.random() * colors.length)],
    createdAt: new Date(),
  }
}

export function createFlashcard(
  front: string,
  back: string,
  deckId: string,
  frontLanguage?: string,
  backLanguage?: string,
): Flashcard {
  const now = new Date()
  // Set nextReview to 1 minute ago to ensure cards are immediately due for review
  const nextReview = new Date(now.getTime() - 60 * 1000)
  return {
    id: crypto.randomUUID(),
    deckId,
    front,
    back,
    frontLanguage,
    backLanguage,
    createdAt: now,
    nextReview: nextReview,
    interval: 1,
    repetition: 0,
    efactor: 2.5,
  }
}

export function reviewFlashcard(flashcard: Flashcard, grade: SuperMemoGrade): Flashcard {
  const item: SuperMemoItem = {
    interval: flashcard.interval,
    repetition: flashcard.repetition,
    efactor: flashcard.efactor,
  }

  const result = supermemo(item, grade)
  const now = new Date()
  const nextReview = new Date(now.getTime() + result.interval * 24 * 60 * 60 * 1000)

  return {
    ...flashcard,
    lastReviewed: now,
    nextReview,
    interval: result.interval,
    repetition: result.repetition,
    efactor: result.efactor,
  }
}

export function getDueFlashcards(flashcards: Flashcard[], deckId?: string): Flashcard[] {
  const now = new Date()
  let filtered = flashcards.filter((card) => card.nextReview <= now)

  if (deckId) {
    filtered = filtered.filter((card) => card.deckId === deckId)
  }

  return filtered
}

export function getFlashcardsByDeck(flashcards: Flashcard[], deckId: string): Flashcard[] {
  return flashcards.filter((card) => card.deckId === deckId)
}

export function getDeckStats(flashcards: Flashcard[], deck: Deck): DeckStats {
  const deckCards = getFlashcardsByDeck(flashcards, deck.id)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const dueCards = getDueFlashcards(deckCards).length
  const reviewedToday = deckCards.filter((card) => card.lastReviewed && card.lastReviewed >= today).length

  const averageEfactor =
    deckCards.length > 0 ? deckCards.reduce((sum, card) => sum + card.efactor, 0) / deckCards.length : 2.5

  return {
    deckId: deck.id,
    deckName: deck.name,
    totalCards: deckCards.length,
    dueCards,
    reviewedToday,
    averageEfactor: Math.round(averageEfactor * 100) / 100,
  }
}

export function getOverallStats(flashcards: Flashcard[]): any {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const dueCards = getDueFlashcards(flashcards).length
  const reviewedToday = flashcards.filter((card) => card.lastReviewed && card.lastReviewed >= today).length

  const averageEfactor =
    flashcards.length > 0 ? flashcards.reduce((sum, card) => sum + card.efactor, 0) / flashcards.length : 2.5

  return {
    totalCards: flashcards.length,
    dueCards,
    reviewedToday,
    averageEfactor: Math.round(averageEfactor * 100) / 100,
  }
}
