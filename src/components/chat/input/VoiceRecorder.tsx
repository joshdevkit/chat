import { Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/hooks/useVoiceRecorder'

interface Props {
    duration: number
    sending: boolean  // ← added
    onStop: () => void
    onCancel: () => void
}

export function VoiceRecorder({ duration, sending, onStop, onCancel }: Props) {
    return (
        <div className="flex items-center gap-3 px-1">
            {sending ? (
                <>
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-xs text-muted-foreground">Sending...</span>
                </>
            ) : (
                <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="text-sm font-mono text-muted-foreground w-10">
                        {formatDuration(duration)}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">Recording...</span>
                    <button
                        onClick={onCancel}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                        Cancel
                    </button>
                    <Button size="icon" className="rounded-full w-8 h-8" onClick={onStop}>
                        <Square className="w-3 h-3 fill-current" />
                    </Button>
                </>
            )}
        </div>
    )
}