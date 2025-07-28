"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Save, X } from "lucide-react"
import type { Flashcard, Deck } from "../types/flashcard"
import { CodeDisplay, supportedLanguages } from "./code-display"

interface EditFlashcardFormProps {
  card: Flashcard
  deck: Deck
  onSave: (front: string, back: string, frontLanguage?: string, backLanguage?: string) => void
  onCancel: () => void
}

export function EditFlashcardForm({ card, deck, onSave, onCancel }: EditFlashcardFormProps) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [frontLanguage, setFrontLanguage] = useState(card.frontLanguage || "plaintext")
  const [backLanguage, setBackLanguage] = useState(card.backLanguage || "plaintext")
  const [previewMode, setPreviewMode] = useState<"front" | "back" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onSave(
        front.trim(),
        back.trim(),
        frontLanguage === "plaintext" ? undefined : frontLanguage,
        backLanguage === "plaintext" ? undefined : backLanguage,
      )
    }
  }

  const insertHtmlTag = (tag: string, textarea: "front" | "back") => {
    const value = textarea === "front" ? front : back
    const setter = textarea === "front" ? setFront : setBack

    const openTag = `<${tag}>`
    const closeTag = `</${tag}>`
    const newValue = value + openTag + closeTag
    setter(newValue)
  }

  const htmlButtons = [
    { tag: "b", label: "Bold" },
    { tag: "i", label: "Italic" },
    { tag: "u", label: "Underline" },
    { tag: "code", label: "Code" },
    { tag: "br", label: "Line Break", selfClosing: true },
  ]

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Edit Card in
            <Badge variant="secondary" className={deck.color}>
              {deck.name}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          💡 HTML is supported! For code, select a programming language for syntax highlighting.
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Front Side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-front">Front (Question)</Label>
              <div className="flex gap-2">
                <Select value={frontLanguage} onValueChange={setFrontLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(previewMode === "front" ? null : "front")}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            {frontLanguage === "plaintext" && (
              <div className="flex flex-wrap gap-1 mb-2">
                {htmlButtons.map((btn) => (
                  <Button
                    key={btn.tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (btn.selfClosing) {
                        setFront(front + `<${btn.tag}>`)
                      } else {
                        insertHtmlTag(btn.tag, "front")
                      }
                    }}
                    className="text-xs h-7"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}

            {previewMode === "front" ? (
              <div className="min-h-[80px] p-3 border rounded-md bg-muted/50 dark:bg-muted/50 dark:border-border">
                <div className="text-sm text-muted-foreground mb-1">Preview:</div>
                {frontLanguage !== "plaintext" ? (
                  <CodeDisplay code={front || "// No content"} language={frontLanguage} />
                ) : (
                  <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: front || "<em>No content</em>" }} />
                )}
              </div>
            ) : frontLanguage !== "plaintext" ? (
              <CodeDisplay
                code={front}
                language={frontLanguage}
                readOnly={false}
                onChange={setFront}
                className="border rounded-md bg-background dark:bg-background dark:border-border"
              />
            ) : (
              <Textarea
                id="edit-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the question or prompt... (HTML supported)"
                className="min-h-[80px] text-sm"
              />
            )}
          </div>

          {/* Back Side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-back">Back (Answer)</Label>
              <div className="flex gap-2">
                <Select value={backLanguage} onValueChange={setBackLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(previewMode === "back" ? null : "back")}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            {backLanguage === "plaintext" && (
              <div className="flex flex-wrap gap-1 mb-2">
                {htmlButtons.map((btn) => (
                  <Button
                    key={btn.tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (btn.selfClosing) {
                        setBack(back + `<${btn.tag}>`)
                      } else {
                        insertHtmlTag(btn.tag, "back")
                      }
                    }}
                    className="text-xs h-7"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}

            {previewMode === "back" ? (
              <div className="min-h-[80px] p-3 border rounded-md bg-muted/50 dark:bg-muted/50 dark:border-border">
                <div className="text-sm text-muted-foreground mb-1">Preview:</div>
                {backLanguage !== "plaintext" ? (
                  <CodeDisplay code={back || "// No content"} language={backLanguage} />
                ) : (
                  <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: back || "<em>No content</em>" }} />
                )}
              </div>
            ) : backLanguage !== "plaintext" ? (
              <CodeDisplay
                code={back}
                language={backLanguage}
                readOnly={false}
                onChange={setBack}
                className="border rounded-md bg-background dark:bg-background dark:border-border"
              />
            ) : (
              <Textarea
                id="edit-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the answer or explanation... (HTML supported)"
                className="min-h-[80px] text-sm"
              />
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
