import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎']

interface Props {
    isMe: boolean
    onReact: (emoji: string) => void
    onClose: () => void
}

export function ReactionPicker({ isMe, onReact, onClose }: Props) {
    return (
        <div className={cn(
            'absolute bottom-full mb-2 z-10 flex gap-1',
            'bg-background border rounded-full px-3 py-2 shadow-md',
            isMe ? 'right-0' : 'left-0'
        )}>
            {REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onReact(emoji)}
                    className="hover:scale-125 transition-transform text-base leading-none"
                >
                    {emoji}
                </button>
            ))}
            <button
                onClick={onClose}
                className="ml-1 text-muted-foreground hover:text-foreground"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}