"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye } from "lucide-react"
import type { Deck } from "../types/flashcard"
import { CodeDisplay, supportedLanguages } from "./code-display"

interface AddFlashcardFormProps {
  selectedDeck: Deck | undefined
  onAdd: (front: string, back: string, frontLanguage?: string, backLanguage?: string) => void
}

export function AddFlashcardForm({ selectedDeck, onAdd }: AddFlashcardFormProps) {
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [frontLanguage, setFrontLanguage] = useState("plaintext")
  const [backLanguage, setBackLanguage] = useState("plaintext")
  const [previewMode, setPreviewMode] = useState<"front" | "back" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim() && selectedDeck) {
      onAdd(
        front.trim(),
        back.trim(),
        frontLanguage === "plaintext" ? undefined : frontLanguage,
        backLanguage === "plaintext" ? undefined : backLanguage,
      )
      setFront("")
      setBack("")
      setFrontLanguage("plaintext")
      setBackLanguage("plaintext")
      setPreviewMode(null)
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

  if (!selectedDeck) {
    return (
      <Card>
        <CardContent className="text-center py-8 md:py-12">
          <p className="text-muted-foreground">Please select a deck to add flashcards.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base md:text-lg">
          <span>Add Card to</span>
          <Badge variant="secondary" className={selectedDeck.color}>
            {selectedDeck.name}
          </Badge>
        </CardTitle>
        <div className="text-xs md:text-sm text-muted-foreground">
          💡 HTML is supported! For code, select a programming language for syntax highlighting.
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Front Side */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="front" className="text-sm md:text-base">
                Front (Question)
              </Label>
              <div className="flex gap-2">
                <Select value={frontLanguage} onValueChange={setFrontLanguage}>
                  <SelectTrigger className="w-28 md:w-32 text-xs md:text-sm">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-xs md:text-sm">
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
                  className="text-xs"
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
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Preview:</div>
                {frontLanguage !== "plaintext" ? (
                  <div className="overflow-x-auto">
                    <CodeDisplay code={front || "// No content"} language={frontLanguage} />
                  </div>
                ) : (
                  <div
                    className="text-sm md:text-base prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: front || "<em>No content</em>" }}
                  />
                )}
              </div>
            ) : frontLanguage !== "plaintext" ? (
              <div className="overflow-x-auto">
                <CodeDisplay
                  code={front}
                  language={frontLanguage}
                  readOnly={false}
                  onChange={setFront}
                  className="border rounded-md"
                />
              </div>
            ) : (
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the question or prompt... (HTML supported)"
                className="min-h-[80px] text-sm md:text-base"
              />
            )}
          </div>

          {/* Back Side */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="back" className="text-sm md:text-base">
                Back (Answer)
              </Label>
              <div className="flex gap-2">
                <Select value={backLanguage} onValueChange={setBackLanguage}>
                  <SelectTrigger className="w-28 md:w-32 text-xs md:text-sm">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-xs md:text-sm">
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
                  className="text-xs"
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
                <div className="text-xs md:text-sm text-muted-foreground mb-1">Preview:</div>
                {backLanguage !== "plaintext" ? (
                  <div className="overflow-x-auto">
                    <CodeDisplay code={back || "// No content"} language={backLanguage} />
                  </div>
                ) : (
                  <div
                    className="text-sm md:text-base prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: back || "<em>No content</em>" }}
                  />
                )}
              </div>
            ) : backLanguage !== "plaintext" ? (
              <div className="overflow-x-auto">
                <CodeDisplay
                  code={back}
                  language={backLanguage}
                  readOnly={false}
                  onChange={setBack}
                  className="border rounded-md"
                />
              </div>
            ) : (
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the answer or explanation... (HTML supported)"
                className="min-h-[80px] text-sm md:text-base"
              />
            )}
          </div>

          <Button type="submit" className="w-full touch-manipulation">
            Add Flashcard
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
