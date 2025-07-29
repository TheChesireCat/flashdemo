"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SyncStatusProps {
  isOnline: boolean
  lastSync: Date | null
  isSyncing: boolean
  error: string | null
  onSync: () => void
}

export function SyncStatus({ isOnline, lastSync, isSyncing, error, onSync }: SyncStatusProps) {
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    if (isOnline) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <WifiOff className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (error) return "Sync Error"
    if (isSyncing) return "Syncing..."
    if (isOnline) return "Online"
    return "Offline"
  }

  const getStatusColor = () => {
    if (error) return "destructive"
    if (isSyncing) return "secondary"
    if (isOnline) return "default"
    return "secondary"
  }

  const getLastSyncText = () => {
    if (!lastSync) return "Never synced"
    return `Last sync: ${formatDistanceToNow(lastSync, { addSuffix: true })}`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="hidden sm:inline">{getStatusText()}</span>
            </Badge>
            
            {isOnline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{getStatusText()}</div>
            <div className="text-xs text-muted-foreground">
              {getLastSyncText()}
            </div>
            {error && (
              <div className="text-xs text-destructive">
                Error: {error}
              </div>
            )}
            {isOnline && (
              <div className="text-xs text-muted-foreground">
                Click the refresh button to sync manually
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 