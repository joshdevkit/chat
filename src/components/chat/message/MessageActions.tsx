import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteMessage } from '@/hooks/useDeleteMessage'
import { useHideMessage } from '@/hooks/useHideMessage'

interface Props {
    messageId: string
    conversationId: string
    isMe: boolean
    isDeleted: boolean
}

export function MessageActions({ messageId, conversationId, isMe, isDeleted }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const deleteMutation = useDeleteMessage()
    const hideMutation = useHideMessage()

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    if (isDeleted && !isMe) return null

    return (
        <div ref={ref} className="relative self-center">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className={cn(
                    'absolute bottom-full mb-1 z-50',
                    'bg-background border rounded-lg shadow-lg py-1',
                    isMe ? 'right-0' : 'left-0',  // ← anchor to correct side based on sender
                )}>
                    {isMe && !isDeleted && (
                        <button
                            onClick={() => {
                                deleteMutation.mutate({ messageId, conversationId })
                                setOpen(false)
                            }}
                            disabled={deleteMutation.isPending}
                            className="w-full flex items-center gap-2 px-3 py-1 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            {deleteMutation.isPending ? 'Unsending...' : 'Unsent'}
                        </button>
                    )}

                    {!isMe && (
                        <button
                            onClick={() => {
                                hideMutation.mutate({ messageId, conversationId })
                                setOpen(false)
                            }}
                            disabled={hideMutation.isPending}
                            className="w-full flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:bg-muted transition-colors"
                        >
                            {hideMutation.isPending ? 'Hiding...' : 'Delete message'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}