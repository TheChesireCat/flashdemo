"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface CramModeToggleProps {
  isCramMode: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
  className?: string
}

export function CramModeToggle({ 
  isCramMode, 
  onToggle, 
  disabled = false,
  className 
}: CramModeToggleProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(checked)
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="flex items-center space-x-2">
        {isCramMode ? (
          <Brain className="h-4 w-4 text-orange-500" />
        ) : (
          <BookOpen className="h-4 w-4 text-blue-500" />
        )}
        <Label 
          htmlFor="cram-mode-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          Cram Mode
        </Label>
      </div>
      
      <Switch
        id="cram-mode-toggle"
        checked={isCramMode}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label={isCramMode ? "Disable cram mode" : "Enable cram mode"}
        aria-describedby="cram-mode-description"
      />
      
      <Badge 
        variant={isCramMode ? "default" : "secondary"}
        className={cn(
          "text-xs",
          isCramMode && "bg-orange-500 hover:bg-orange-600"
        )}
      >
        {isCramMode ? "CRAM" : "REVIEW"}
      </Badge>
      
      <span 
        id="cram-mode-description" 
        className="sr-only"
      >
        {isCramMode 
          ? "Cram mode is active. All cards will be shown regardless of due date, and SuperMemo intervals will not be updated."
          : "Regular review mode is active. Only due cards will be shown and SuperMemo intervals will be updated."
        }
      </span>
    </div>
  )
}