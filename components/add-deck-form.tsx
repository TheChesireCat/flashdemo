"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface AddDeckFormProps {
  onAdd: (name: string, description?: string) => void
}

export function AddDeckForm({ onAdd }: AddDeckFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), description.trim() || undefined)
      setName("")
      setDescription("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="deck-name">Deck Name</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spanish Vocabulary"
              required
            />
          </div>
          <div>
            <Label htmlFor="deck-description">Description (Optional)</Label>
            <Textarea
              id="deck-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this deck..."
              className="min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Create Deck
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
