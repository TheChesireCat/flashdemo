"use client"

import { BookOpen, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AddDeckForm } from "./add-deck-form"
import type { Deck, DeckStats } from "../types/flashcard"
import { NotoV1ClownFace } from "./favicon"

interface AppSidebarProps {
  decks: Deck[]
  selectedDeckId: string | null
  onSelectDeck: (deckId: string) => void
  onAddDeck: (name: string, description?: string) => void
  onDeleteDeck: (deckId: string) => void
  getDeckStats: (deck: Deck) => DeckStats
}

export function AppSidebar({
  decks,
  selectedDeckId,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  getDeckStats,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <NotoV1ClownFace className="w-6 h-6" />
          <h2 className="font-semibold">L337Deck</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Decks</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 pb-2">
              <AddDeckForm onAdd={onAddDeck} />
            </div>
            <SidebarMenu>
              {decks.map((deck) => {
                const stats = getDeckStats(deck)
                const isSelected = deck.id === selectedDeckId

                return (
                  <SidebarMenuItem key={deck.id}>
                    <SidebarMenuButton asChild isActive={isSelected} className="h-auto p-3">
                      <button onClick={() => onSelectDeck(deck.id)} className="w-full text-left">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{deck.name}</div>
                            {deck.description && (
                              <div className="text-xs text-muted-foreground truncate">{deck.description}</div>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {stats.totalCards} cards
                              </Badge>
                              {stats.dueCards > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {stats.dueCards} due
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={() => onDeleteDeck(deck.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
