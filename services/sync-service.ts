import { useFlashcardStore } from '@/stores/flashcard-store'
import { useSyncData, useDecks, useFlashcards } from '@/hooks/use-supabase-queries'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

export function useSyncService() {
  const { user } = useAuth()
  const syncMutation = useSyncData()
  const { data: dbDecks, isLoading: decksLoading } = useDecks(user?.id)
  const { data: dbFlashcards, isLoading: flashcardsLoading } = useFlashcards(user?.id)
  
  const {
    flashcards,
    decks,
    setFlashcards,
    setDecks,
    setSyncStatus,
  } = useFlashcardStore()

  // Sync local state with database when user is authenticated
  useEffect(() => {
    if (!user) {
      setSyncStatus({ isOnline: false, lastSync: null, isSyncing: false, error: null })
      return
    }

    setSyncStatus({ isOnline: true, lastSync: null, isSyncing: decksLoading || flashcardsLoading, error: null })

    if (dbDecks && dbFlashcards) {
      // Merge database data with local data
      const mergedDecks = mergeDecks(decks, dbDecks)
      const mergedFlashcards = mergeFlashcards(flashcards, dbFlashcards)
      
      setDecks(mergedDecks)
      setFlashcards(mergedFlashcards)
      
      const now = new Date()
      setSyncStatus({ 
        isOnline: true, 
        lastSync: now, 
        isSyncing: false, 
        error: null 
      })

      // Sync back to database
      syncMutation.mutate({
        userId: user.id,
        decks: mergedDecks,
        flashcards: mergedFlashcards,
      })
    }
  }, [user, dbDecks, dbFlashcards, decksLoading, flashcardsLoading])

  const syncWithDatabase = () => {
    if (!user) return

    setSyncStatus({ isOnline: true, lastSync: null, isSyncing: true, error: null })
    
    syncMutation.mutate({
      userId: user.id,
      decks,
      flashcards,
    }, {
      onSuccess: () => {
        const now = new Date()
        setSyncStatus({ 
          isOnline: true, 
          lastSync: now, 
          isSyncing: false, 
          error: null 
        })
      },
      onError: (error) => {
        setSyncStatus({ 
          isOnline: true, 
          lastSync: null, 
          isSyncing: false, 
          error: error.message 
        })
      }
    })
  }

  return {
    syncWithDatabase,
    isSyncing: syncMutation.isPending || decksLoading || flashcardsLoading,
    syncError: syncMutation.error?.message,
  }
}

// Helper functions for merging data
function mergeDecks(localDecks: any[], dbDecks: any[]): any[] {
  const merged = new Map()
  
  // Add local decks
  localDecks.forEach(deck => merged.set(deck.id, deck))
  
  // Add/update with database decks (database wins on conflicts)
  dbDecks.forEach(deck => merged.set(deck.id, deck))
  
  return Array.from(merged.values())
}

function mergeFlashcards(localFlashcards: any[], dbFlashcards: any[]): any[] {
  const merged = new Map()
  
  // Add local flashcards
  localFlashcards.forEach(card => merged.set(card.id, card))
  
  // Add/update with database flashcards (database wins on conflicts)
  dbFlashcards.forEach(card => merged.set(card.id, card))
  
  return Array.from(merged.values())
} 