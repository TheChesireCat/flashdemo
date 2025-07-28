export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  frontLanguage?: string // Programming language for syntax highlighting
  backLanguage?: string // Programming language for syntax highlighting
  createdAt: Date
  lastReviewed?: Date
  nextReview: Date
  interval: number
  repetition: number
  efactor: number
}

export interface Deck {
  id: string
  name: string
  description?: string
  color: string
  createdAt: Date
}

export interface FlashcardStats {
  totalCards: number
  dueCards: number
  reviewedToday: number
  averageEfactor: number
}

export interface DeckStats extends FlashcardStats {
  deckId: string
  deckName: string
}
