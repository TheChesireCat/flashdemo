import { supabase } from './supabase'
import type { Flashcard, Deck } from '@/types/flashcard'
import type { Database } from './database.types'

type DeckRow = Database['public']['Tables']['decks']['Row']
type FlashcardRow = Database['public']['Tables']['flashcards']['Row']
type ReviewSessionRow = Database['public']['Tables']['review_sessions']['Row']

// Convert database row to app type
const deckRowToDeck = (row: DeckRow): Deck => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  color: row.color,
  createdAt: new Date(row.created_at),
})

const flashcardRowToFlashcard = (row: FlashcardRow): Flashcard => ({
  id: row.id,
  deckId: row.deck_id,
  front: row.front,
  back: row.back,
  frontLanguage: row.front_language || undefined,
  backLanguage: row.back_language || undefined,
  createdAt: new Date(row.created_at),
  lastReviewed: row.last_reviewed ? new Date(row.last_reviewed) : undefined,
  nextReview: new Date(row.next_review),
  interval: row.interval,
  repetition: row.repetition,
  efactor: row.efactor,
})

// Convert app type to database row
const deckToDeckRow = (deck: Deck, userId: string): Database['public']['Tables']['decks']['Insert'] => ({
  id: deck.id,
  user_id: userId,
  name: deck.name,
  description: deck.description || null,
  color: deck.color,
  created_at: deck.createdAt.toISOString(),
  updated_at: new Date().toISOString(),
})

const flashcardToFlashcardRow = (flashcard: Flashcard, userId: string): Database['public']['Tables']['flashcards']['Insert'] => ({
  id: flashcard.id,
  deck_id: flashcard.deckId,
  user_id: userId,
  front: flashcard.front,
  back: flashcard.back,
  front_language: flashcard.frontLanguage || null,
  back_language: flashcard.backLanguage || null,
  created_at: flashcard.createdAt.toISOString(),
  last_reviewed: flashcard.lastReviewed?.toISOString() || null,
  next_review: flashcard.nextReview.toISOString(),
  interval: flashcard.interval,
  repetition: flashcard.repetition,
  efactor: flashcard.efactor,
  updated_at: new Date().toISOString(),
})

export class DatabaseService {
  // Deck operations
  static async getDecks(userId: string): Promise<Deck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(deckRowToDeck)
  }

  static async createDeck(deck: Deck, userId: string): Promise<Deck> {
    const deckRow = deckToDeckRow(deck, userId)
    const { data, error } = await supabase
      .from('decks')
      .insert(deckRow)
      .select()
      .single()

    if (error) throw error
    return deckRowToDeck(data)
  }

  static async updateDeck(deck: Deck, userId: string): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .update({
        name: deck.name,
        description: deck.description || null,
        color: deck.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deck.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return deckRowToDeck(data)
  }

  static async deleteDeck(deckId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Flashcard operations
  static async getFlashcards(userId: string, deckId?: string): Promise<Flashcard[]> {
    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)

    if (deckId) {
      query = query.eq('deck_id', deckId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data.map(flashcardRowToFlashcard)
  }

  static async createFlashcard(flashcard: Flashcard, userId: string): Promise<Flashcard> {
    const flashcardRow = flashcardToFlashcardRow(flashcard, userId)
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcardRow)
      .select()
      .single()

    if (error) throw error
    return flashcardRowToFlashcard(data)
  }

  static async updateFlashcard(flashcard: Flashcard, userId: string): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .update({
        front: flashcard.front,
        back: flashcard.back,
        front_language: flashcard.frontLanguage || null,
        back_language: flashcard.backLanguage || null,
        last_reviewed: flashcard.lastReviewed?.toISOString() || null,
        next_review: flashcard.nextReview.toISOString(),
        interval: flashcard.interval,
        repetition: flashcard.repetition,
        efactor: flashcard.efactor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', flashcard.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return flashcardRowToFlashcard(data)
  }

  static async deleteFlashcard(flashcardId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', flashcardId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Review session operations
  static async createReviewSession(
    userId: string,
    deckId: string | null,
    sessionType: 'spaced_repetition' | 'cram',
    cardsReviewed: number,
    correctAnswers: number,
  ): Promise<void> {
    const { error } = await supabase
      .from('review_sessions')
      .insert({
        user_id: userId,
        deck_id: deckId,
        session_type: sessionType,
        cards_reviewed: cardsReviewed,
        correct_answers: correctAnswers,
        session_start: new Date().toISOString(),
        session_end: new Date().toISOString(),
      })

    if (error) throw error
  }

  // Bulk operations for sync
  static async syncData(
    userId: string,
    decks: Deck[],
    flashcards: Flashcard[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use a transaction-like approach with error handling
      const { error: decksError } = await supabase
        .from('decks')
        .upsert(decks.map(deck => deckToDeckRow(deck, userId)), {
          onConflict: 'id',
        })

      if (decksError) throw decksError

      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .upsert(flashcards.map(flashcard => flashcardToFlashcardRow(flashcard, userId)), {
          onConflict: 'id',
        })

      if (flashcardsError) throw flashcardsError

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalDecks: number
    totalFlashcards: number
    totalReviewSessions: number
    averageEfactor: number
  }> {
    const [decksResult, flashcardsResult, sessionsResult] = await Promise.all([
      supabase.from('decks').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('flashcards').select('efactor').eq('user_id', userId),
      supabase.from('review_sessions').select('id', { count: 'exact' }).eq('user_id', userId),
    ])

    if (decksResult.error) throw decksResult.error
    if (flashcardsResult.error) throw flashcardsResult.error
    if (sessionsResult.error) throw sessionsResult.error

    const totalFlashcards = flashcardsResult.data?.length || 0
    const averageEfactor = totalFlashcards > 0
      ? flashcardsResult.data!.reduce((sum: number, card: { efactor: number }) => sum + card.efactor, 0) / totalFlashcards
      : 2.5

    return {
      totalDecks: decksResult.count || 0,
      totalFlashcards,
      totalReviewSessions: sessionsResult.count || 0,
      averageEfactor: Math.round(averageEfactor * 100) / 100,
    }
  }
} 