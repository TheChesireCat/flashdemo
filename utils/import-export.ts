import type { Flashcard, Deck } from "../types/flashcard"

export interface ExportData {
  version: string
  exportDate: string
  decks: Deck[]
  flashcards: Flashcard[]
}

export function exportData(decks: Deck[], flashcards: Flashcard[], selectedDeckId?: string): ExportData {
  let exportDecks = decks
  let exportFlashcards = flashcards

  // If a specific deck is selected, only export that deck and its cards
  if (selectedDeckId) {
    exportDecks = decks.filter((deck) => deck.id === selectedDeckId)
    exportFlashcards = flashcards.filter((card) => card.deckId === selectedDeckId)
  }

  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    decks: exportDecks,
    flashcards: exportFlashcards,
  }
}

export function downloadJson(data: ExportData, filename: string) {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function validateImportData(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid file format - not a valid JSON object" }
  }

  if (!data.version) {
    return { isValid: false, error: "Missing version field" }
  }

  if (!data.decks || !Array.isArray(data.decks)) {
    return { isValid: false, error: "Missing or invalid decks array" }
  }

  if (!data.flashcards || !Array.isArray(data.flashcards)) {
    return { isValid: false, error: "Missing or invalid flashcards array" }
  }

  // Create a set of valid deck IDs from the import data
  const importDeckIds = new Set<string>()

  // Validate deck structure and collect IDs
  for (let i = 0; i < data.decks.length; i++) {
    const deck = data.decks[i]
    if (!deck.id || typeof deck.id !== "string") {
      return {
        isValid: false,
        error: `Deck ${i + 1}: Missing or invalid id (got: ${typeof deck.id}, value: ${JSON.stringify(deck.id)})`,
      }
    }
    if (!deck.name || typeof deck.name !== "string") {
      return {
        isValid: false,
        error: `Deck ${i + 1}: Missing or invalid name (got: ${typeof deck.name}, value: ${JSON.stringify(deck.name)})`,
      }
    }
    if (!deck.createdAt) {
      return { isValid: false, error: `Deck ${i + 1}: Missing createdAt` }
    }
    // color is optional but should be string if present
    if (deck.color && typeof deck.color !== "string") {
      return { isValid: false, error: `Deck ${i + 1}: Invalid color field` }
    }

    importDeckIds.add(deck.id)
  }

  console.log("Valid deck IDs from import:", Array.from(importDeckIds))

  // Validate flashcard structure
  for (let i = 0; i < data.flashcards.length; i++) {
    const card = data.flashcards[i]

    if (!card.id || typeof card.id !== "string") {
      return {
        isValid: false,
        error: `Card ${i + 1}: Missing or invalid id (got: ${typeof card.id}, value: ${JSON.stringify(card.id)})`,
      }
    }

    // More detailed deckId validation
    if (!card.deckId) {
      return { isValid: false, error: `Card ${i + 1}: Missing deckId (value: ${JSON.stringify(card.deckId)})` }
    }
    if (typeof card.deckId !== "string") {
      return {
        isValid: false,
        error: `Card ${i + 1}: Invalid deckId type (got: ${typeof card.deckId}, value: ${JSON.stringify(card.deckId)})`,
      }
    }
    if (card.deckId.trim() === "") {
      return { isValid: false, error: `Card ${i + 1}: Empty deckId string` }
    }

    // Check if the card's deckId references a valid deck in the import data
    if (!importDeckIds.has(card.deckId)) {
      return {
        isValid: false,
        error: `Card ${i + 1}: References non-existent deck ID "${card.deckId}". Available deck IDs: ${Array.from(importDeckIds).join(", ")}`,
      }
    }

    if (!card.front || typeof card.front !== "string") {
      return { isValid: false, error: `Card ${i + 1}: Missing or invalid front content (got: ${typeof card.front})` }
    }
    if (!card.back || typeof card.back !== "string") {
      return { isValid: false, error: `Card ${i + 1}: Missing or invalid back content (got: ${typeof card.back})` }
    }
    if (!card.createdAt) {
      return { isValid: false, error: `Card ${i + 1}: Missing createdAt` }
    }
    if (!card.nextReview) {
      return { isValid: false, error: `Card ${i + 1}: Missing nextReview` }
    }

    // Check numeric fields with more detail
    if (card.interval === undefined || card.interval === null) {
      return { isValid: false, error: `Card ${i + 1}: Missing interval field` }
    }
    if (typeof card.interval !== "number" || isNaN(card.interval)) {
      return {
        isValid: false,
        error: `Card ${i + 1}: Invalid interval (must be a number, got ${typeof card.interval}, value: ${JSON.stringify(card.interval)})`,
      }
    }

    if (card.repetition === undefined || card.repetition === null) {
      return { isValid: false, error: `Card ${i + 1}: Missing repetition field` }
    }
    if (typeof card.repetition !== "number" || isNaN(card.repetition)) {
      return {
        isValid: false,
        error: `Card ${i + 1}: Invalid repetition (must be a number, got ${typeof card.repetition}, value: ${JSON.stringify(card.repetition)})`,
      }
    }

    if (card.efactor === undefined || card.efactor === null) {
      return { isValid: false, error: `Card ${i + 1}: Missing efactor field` }
    }
    if (typeof card.efactor !== "number" || isNaN(card.efactor)) {
      return {
        isValid: false,
        error: `Card ${i + 1}: Invalid efactor (must be a number, got ${typeof card.efactor}, value: ${JSON.stringify(card.efactor)})`,
      }
    }

    // Optional fields validation
    if (card.frontLanguage && typeof card.frontLanguage !== "string") {
      return { isValid: false, error: `Card ${i + 1}: Invalid frontLanguage (must be string)` }
    }
    if (card.backLanguage && typeof card.backLanguage !== "string") {
      return { isValid: false, error: `Card ${i + 1}: Invalid backLanguage (must be string)` }
    }
  }

  return { isValid: true }
}

export function processImportData(data: ExportData): {
  decks: Deck[]
  flashcards: Flashcard[]
} {
  const decks = data.decks.map((deck) => ({
    ...deck,
    // Ensure all required fields are present with defaults
    color: deck.color || "bg-blue-500",
    description: deck.description || undefined,
    createdAt: new Date(deck.createdAt),
  }))

  const flashcards = data.flashcards.map((card) => ({
    ...card,
    // Ensure optional fields are handled properly
    frontLanguage: card.frontLanguage || undefined,
    backLanguage: card.backLanguage || undefined,
    createdAt: new Date(card.createdAt),
    lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
    nextReview: new Date(card.nextReview),
    // Ensure numeric fields are properly typed
    interval: Number(card.interval),
    repetition: Number(card.repetition),
    efactor: Number(card.efactor),
  }))

  return { decks, flashcards }
}

export function generateUniqueId(): string {
  return crypto.randomUUID()
}

export function resolveConflicts(
  existingDecks: Deck[],
  existingFlashcards: Flashcard[],
  importDecks: Deck[],
  importFlashcards: Flashcard[],
  strategy: "skip" | "rename" | "replace" = "rename",
): {
  decks: Deck[]
  flashcards: Flashcard[]
  conflicts: { type: "deck" | "card"; name: string; action: string }[]
} {
  const conflicts: { type: "deck" | "card"; name: string; action: string }[] = []
  const finalDecks = [...existingDecks]
  const finalFlashcards = [...existingFlashcards]
  const deckIdMapping: Record<string, string> = {}

  console.log("Starting conflict resolution...")
  console.log("Import decks:", importDecks.length)
  console.log("Import flashcards:", importFlashcards.length)
  console.log("Existing decks:", existingDecks.length)
  console.log("Strategy:", strategy)

  // Handle deck conflicts first
  for (const importDeck of importDecks) {
    const existingDeck = existingDecks.find((d) => d.name === importDeck.name)

    if (existingDeck) {
      if (strategy === "skip") {
        conflicts.push({ type: "deck", name: importDeck.name, action: "skipped" })
        deckIdMapping[importDeck.id] = existingDeck.id
        console.log(`Deck "${importDeck.name}" skipped, mapping ${importDeck.id} -> ${existingDeck.id}`)
      } else if (strategy === "rename") {
        const newName = `${importDeck.name} (Imported)`
        const newId = generateUniqueId()
        const newDeck = { ...importDeck, id: newId, name: newName }
        finalDecks.push(newDeck)
        deckIdMapping[importDeck.id] = newId
        conflicts.push({ type: "deck", name: importDeck.name, action: `renamed to "${newName}"` })
        console.log(`Deck "${importDeck.name}" renamed, mapping ${importDeck.id} -> ${newId}`)
      } else if (strategy === "replace") {
        const index = finalDecks.findIndex((d) => d.id === existingDeck.id)
        finalDecks[index] = { ...importDeck, id: existingDeck.id }
        deckIdMapping[importDeck.id] = existingDeck.id
        conflicts.push({ type: "deck", name: importDeck.name, action: "replaced" })
        console.log(`Deck "${importDeck.name}" replaced, mapping ${importDeck.id} -> ${existingDeck.id}`)
      }
    } else {
      // No conflict, add the deck as-is
      finalDecks.push(importDeck)
      deckIdMapping[importDeck.id] = importDeck.id
      console.log(`Deck "${importDeck.name}" added without conflict, mapping ${importDeck.id} -> ${importDeck.id}`)
    }
  }

  console.log("Deck ID mapping:", deckIdMapping)

  // Handle flashcard conflicts and update deck IDs
  let processedCards = 0
  let skippedCards = 0

  for (const importCard of importFlashcards) {
    const newDeckId = deckIdMapping[importCard.deckId]

    if (!newDeckId) {
      console.warn(
        `Skipping card "${importCard.front.substring(0, 30)}..." - no mapping found for deck ID ${importCard.deckId}`,
      )
      skippedCards++
      continue // Skip cards for decks that weren't imported
    }

    const newCard = { ...importCard, deckId: newDeckId }
    const existingCard = existingFlashcards.find((c) => c.front === newCard.front && c.deckId === newDeckId)

    if (existingCard) {
      if (strategy === "skip") {
        conflicts.push({ type: "card", name: importCard.front.substring(0, 50), action: "skipped" })
      } else if (strategy === "rename") {
        const newId = generateUniqueId()
        finalFlashcards.push({ ...newCard, id: newId })
        conflicts.push({ type: "card", name: importCard.front.substring(0, 50), action: "imported as duplicate" })
        processedCards++
      } else if (strategy === "replace") {
        const index = finalFlashcards.findIndex((c) => c.id === existingCard.id)
        finalFlashcards[index] = { ...newCard, id: existingCard.id }
        conflicts.push({ type: "card", name: importCard.front.substring(0, 50), action: "replaced" })
        processedCards++
      }
    } else {
      // No conflict, add the card
      finalFlashcards.push(newCard)
      processedCards++
    }
  }

  console.log(`Processed ${processedCards} cards, skipped ${skippedCards} cards`)
  console.log("Final decks:", finalDecks.length)
  console.log("Final flashcards:", finalFlashcards.length)

  return { decks: finalDecks, flashcards: finalFlashcards, conflicts }
}
