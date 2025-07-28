"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Upload, FileText, AlertCircle, CheckCircle, HelpCircle, Cloud } from "lucide-react"
import type { Deck, Flashcard } from "../types/flashcard"
import {
  exportData,
  downloadJson,
  validateImportData,
  processImportData,
  resolveConflicts,
  type ExportData,
} from "../utils/import-export"
import { createSampleExportFile } from "../utils/sample-data"

interface ImportExportDialogProps {
  decks: Deck[]
  flashcards: Flashcard[]
  selectedDeck?: Deck
  onImport: (decks: Deck[], flashcards: Flashcard[]) => void
}

export function ImportExportDialog({ decks, flashcards, selectedDeck, onImport }: ImportExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"export" | "import">("export")
  const [importMode, setImportMode] = useState<"file" | "url">("file")
  const [urlInput, setUrlInput] = useState("")
  const [exportScope, setExportScope] = useState<"all" | "deck">("all")
  const [importStrategy, setImportStrategy] = useState<"skip" | "rename" | "replace">("rename")
  const [importStatus, setImportStatus] = useState<{
    status: "idle" | "processing" | "success" | "error"
    message?: string
    conflicts?: { type: "deck" | "card"; name: string; action: string }[]
    debugInfo?: string
  }>({ status: "idle" })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const selectedDeckId = exportScope === "deck" ? selectedDeck?.id : undefined
    const data = exportData(decks, flashcards, selectedDeckId)

    const filename =
      exportScope === "deck" && selectedDeck
        ? `${selectedDeck.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_flashcards.json`
        : `all_flashcards_${new Date().toISOString().split("T")[0]}.json`

    downloadJson(data, filename)
    setImportStatus({ status: "success", message: "Export completed successfully!" })
  }

  const handleDownloadSample = () => {
    const sampleData = createSampleExportFile()
    const blob = new Blob([sampleData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "sample_flashcards.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
    setImportStatus({ status: "success", message: "Sample file downloaded!" })
  }

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      setImportStatus({
        status: "error",
        message: "Please enter a valid URL.",
      })
      return
    }

    setImportStatus({ status: "processing", message: "Fetching data from URL..." })

    try {
      const response = await fetch(urlInput.trim())
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      await processImportText(text, "URL")
    } catch (error) {
      console.error("URL import error:", error)
      setImportStatus({
        status: "error",
        message: error instanceof Error 
          ? `Failed to fetch from URL: ${error.message}`
          : "Failed to fetch data from URL. Please check the URL and try again.",
        debugInfo: error instanceof Error ? error.stack : "Unknown error",
      })
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus({ status: "processing", message: "Processing file..." })

    try {
      const text = await file.text()
      await processImportText(text, "file")
    } catch (error) {
      console.error("File import error:", error)
      setImportStatus({
        status: "error",
        message: error instanceof Error
          ? `Import failed: ${error.message}`
          : "Failed to import file. Please check the file format.",
        debugInfo: error instanceof Error ? error.stack : "Unknown error",
      })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processImportText = async (text: string, source: string) => {
    try {
      let data

      try {
        data = JSON.parse(text)
      } catch (parseError) {
        setImportStatus({
          status: "error",
          message: `Invalid JSON ${source}. Please check the format.`,
          debugInfo: `Parse error: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        })
        return
      }

      console.log("Import data structure:", {
        decks: data.decks?.length || 0,
        flashcards: data.flashcards?.length || 0,
        version: data.version,
      })

      // Log the first few items for debugging
      if (data.decks && data.decks.length > 0) {
        console.log("First deck:", JSON.stringify(data.decks[0], null, 2))
      }
      if (data.flashcards && data.flashcards.length > 0) {
        console.log("First flashcard:", JSON.stringify(data.flashcards[0], null, 2))
        console.log("First flashcard deckId:", {
          value: data.flashcards[0].deckId,
          type: typeof data.flashcards[0].deckId,
          isString: typeof data.flashcards[0].deckId === "string",
          isEmpty: data.flashcards[0].deckId === "",
          isNull: data.flashcards[0].deckId === null,
          isUndefined: data.flashcards[0].deckId === undefined,
        })
      }

      const validation = validateImportData(data)
      if (!validation.isValid) {
        const debugInfo =
          `${source} contains ${data.decks?.length || 0} decks and ${data.flashcards?.length || 0} flashcards\n\n` +
          `First deck: ${data.decks?.[0] ? JSON.stringify(data.decks[0], null, 2) : "None"}\n\n` +
          `First flashcard: ${data.flashcards?.[0] ? JSON.stringify(data.flashcards[0], null, 2) : "None"}`

        setImportStatus({
          status: "error",
          message: `Validation failed: ${validation.error}`,
          debugInfo,
        })
        return
      }

      const { decks: importDecks, flashcards: importFlashcards } = processImportData(data as ExportData)

      console.log("Processed import data:", {
        importDecks: importDecks.length,
        importFlashcards: importFlashcards.length,
        existingDecks: decks.length,
        existingFlashcards: flashcards.length,
      })

      const {
        decks: finalDecks,
        flashcards: finalFlashcards,
        conflicts,
      } = resolveConflicts(decks, flashcards, importDecks, importFlashcards, importStrategy)

      console.log("Final result:", {
        finalDecks: finalDecks.length,
        finalFlashcards: finalFlashcards.length,
        conflicts: conflicts.length,
      })

      onImport(finalDecks, finalFlashcards)

      setImportStatus({
        status: "success",
        message: `Import completed! Added ${importDecks.length} decks and ${importFlashcards.length} cards.`,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        debugInfo: `Final result: ${finalDecks.length} decks, ${finalFlashcards.length} cards`,
      })
    } catch (error) {
      console.error("Import processing error:", error)
      setImportStatus({
        status: "error",
        message: error instanceof Error
          ? `Import failed: ${error.message}`
          : `Failed to process ${source}. Please check the format.`,
        debugInfo: error instanceof Error ? error.stack : "Unknown error",
      })
    }
  }

  const resetDialog = () => {
    setImportStatus({ status: "idle" })
    setMode("export")
    setImportMode("file")
    setUrlInput("")
    setExportScope("all")
    setImportStrategy("rename")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs md:text-sm">
          <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          {/* <span className="sm:hidden">Import/Export</span> */}
          <span className="sm:inline">I/E</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">Import/Export Flashcards</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base">Choose Action</Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as "export" | "import")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="export" id="export" />
                <Label htmlFor="export" className="flex items-center gap-2 text-sm md:text-base">
                  <Download className="w-3 h-3 md:w-4 md:h-4" />
                  Export Cards
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="import" id="import" />
                <Label htmlFor="import" className="flex items-center gap-2 text-sm md:text-base">
                  <Upload className="w-3 h-3 md:w-4 md:h-4" />
                  Import Cards
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Options */}
          {mode === "export" && (
            <div className="space-y-3">
              <Label className="text-sm md:text-base">Export Scope</Label>
              <RadioGroup value={exportScope} onValueChange={(value) => setExportScope(value as "all" | "deck")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-sm md:text-base">
                    All Decks ({decks.length} decks, {flashcards.length} cards)
                  </Label>
                </div>
                {selectedDeck && (
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="deck" id="deck" className="mt-1" />
                    <Label htmlFor="deck" className="flex flex-col gap-1 text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        Current Deck
                        <Badge variant="secondary" className={`${selectedDeck.color} text-xs`}>
                          {selectedDeck.name}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({flashcards.filter((c) => c.deckId === selectedDeck.id).length} cards)
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          {/* Import Options */}
          {mode === "import" && (
            <>
              {/* Import Source Selection */}
              <div className="space-y-3">
                <Label className="text-sm md:text-base">Import Source</Label>
                <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as "file" | "url")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="file" id="file" />
                    <Label htmlFor="file" className="flex items-center gap-2 text-sm md:text-base">
                      <Upload className="w-3 h-3 md:w-4 md:h-4" />
                      Upload File
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="url" />
                    <Label htmlFor="url" className="flex items-center gap-2 text-sm md:text-base">
                      <Cloud className="w-3 h-3 md:w-4 md:h-4" />
                      Load from URL
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* URL Input */}
              {importMode === "url" && (
                <div className="space-y-2">
                  <Label htmlFor="url-input" className="text-sm md:text-base">
                    Enter URL
                  </Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/flashcards.json"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to a JSON file containing flashcard data
                  </p>
                </div>
              )}

              {/* Conflict Resolution */}
              <div className="space-y-3">
                <Label className="text-sm md:text-base">Conflict Resolution</Label>
                <RadioGroup
                  value={importStrategy}
                  onValueChange={(value) => setImportStrategy(value as "skip" | "rename" | "replace")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rename" id="rename" />
                    <Label htmlFor="rename" className="text-sm md:text-base">
                      Rename duplicates (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip" className="text-sm md:text-base">
                      Skip duplicates
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace" className="text-sm md:text-base">
                      Replace existing
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {mode === "export" ? (
              <Button onClick={handleExport} className="w-full touch-manipulation">
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Export {exportScope === "all" ? "All Cards" : "Current Deck"}
              </Button>
            ) : (
              <div className="space-y-2">
                {importMode === "file" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="file-input"
                    />
                    <Button asChild className="w-full touch-manipulation" disabled={importStatus.status === "processing"}>
                      <label htmlFor="file-input" className="cursor-pointer">
                        <Upload className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        {importStatus.status === "processing" ? "Processing..." : "Choose File to Import"}
                      </label>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleUrlImport} 
                    className="w-full touch-manipulation" 
                    disabled={importStatus.status === "processing" || !urlInput.trim()}
                  >
                    <Cloud className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    {importStatus.status === "processing" ? "Loading..." : "Load from URL"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDownloadSample}
                  className="w-full text-xs"
                  disabled={importStatus.status === "processing"}
                >
                  <HelpCircle className="w-3 h-3 mr-2" />
                  Download Sample File
                </Button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {importStatus.status !== "idle" && (
            <Alert className={importStatus.status === "error" ? "border-red-200 dark:border-red-800" : "border-green-200 dark:border-green-800"}>
              {importStatus.status === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <AlertDescription className="text-sm">
                {importStatus.message}
                {importStatus.debugInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium">Debug Info</summary>
                    <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-32 whitespace-pre-wrap dark:bg-muted dark:text-foreground">
                      {importStatus.debugInfo}
                    </pre>
                  </details>
                )}
                {importStatus.conflicts && importStatus.conflicts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium">Conflicts resolved:</div>
                    <div className="text-xs space-y-1 max-h-24 md:max-h-32 overflow-y-auto">
                      {importStatus.conflicts.map((conflict, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {conflict.type}
                          </Badge>
                          <span className="truncate text-xs">{conflict.name}</span>
                          <span className="text-muted-foreground text-xs">({conflict.action})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
