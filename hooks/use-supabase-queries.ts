import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatabaseService } from '@/lib/database-service'
import type { Flashcard, Deck } from '@/types/flashcard'
import type { SuperMemoGrade } from 'supermemo'

// Query keys
export const queryKeys = {
  decks: (userId: string) => ['decks', userId],
  flashcards: (userId: string, deckId?: string) => ['flashcards', userId, deckId],
  userStats: (userId: string) => ['userStats', userId],
} as const

// Deck queries
export function useDecks(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.decks(userId!),
    queryFn: () => DatabaseService.getDecks(userId!),
    enabled: !!userId,
  })
}

export function useFlashcards(userId: string | undefined, deckId?: string) {
  return useQuery({
    queryKey: queryKeys.flashcards(userId!, deckId),
    queryFn: () => DatabaseService.getFlashcards(userId!, deckId),
    enabled: !!userId,
  })
}

export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userStats(userId!),
    queryFn: () => DatabaseService.getUserStats(userId!),
    enabled: !!userId,
  })
}

// Deck mutations
export function useCreateDeck() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deck, userId }: { deck: Deck; userId: string }) =>
      DatabaseService.createDeck(deck, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks(userId) })
    },
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deck, userId }: { deck: Deck; userId: string }) =>
      DatabaseService.updateDeck(deck, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks(userId) })
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ deckId, userId }: { deckId: string; userId: string }) =>
      DatabaseService.deleteDeck(deckId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(userId) })
    },
  })
}

// Flashcard mutations
export function useCreateFlashcard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ flashcard, userId }: { flashcard: Flashcard; userId: string }) =>
      DatabaseService.createFlashcard(flashcard, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(userId) })
    },
  })
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ flashcard, userId }: { flashcard: Flashcard; userId: string }) =>
      DatabaseService.updateFlashcard(flashcard, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(userId) })
    },
  })
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ flashcardId, userId }: { flashcardId: string; userId: string }) =>
      DatabaseService.deleteFlashcard(flashcardId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(userId) })
    },
  })
}

// Review session mutations
export function useCreateReviewSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({
      userId,
      deckId,
      sessionType,
      cardsReviewed,
      correctAnswers,
    }: {
      userId: string
      deckId: string | null
      sessionType: 'spaced_repetition' | 'cram'
      cardsReviewed: number
      correctAnswers: number
    }) =>
      DatabaseService.createReviewSession(userId, deckId, sessionType, cardsReviewed, correctAnswers),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats(userId) })
    },
  })
}

// Sync mutations
export function useSyncData() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({
      userId,
      decks,
      flashcards,
    }: {
      userId: string
      decks: Deck[]
      flashcards: Flashcard[]
    }) => DatabaseService.syncData(userId, decks, flashcards),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats(userId) })
    },
  })
} 