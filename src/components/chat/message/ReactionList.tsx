import { cn } from '@/lib/utils'
import { type Message } from '@/hooks/useMessages'

interface Props {
    groupedReactions: Record<string, number>
    reactions: Message['reactions']
    currentUserId: string | undefined
    onReact: (emoji: string) => void
    isMe: boolean
}

export function ReactionList({ groupedReactions, reactions, currentUserId, onReact, isMe }: Props) {
    if (Object.keys(groupedReactions).length === 0) return null

    return (
        <div className={cn('flex flex-wrap gap-0.5', isMe && 'justify-end')}>
            {Object.entries(groupedReactions).map(([emoji, count]) => {
                const reacted = reactions.some(
                    (r) => r.emoji === emoji && r.userId === currentUserId
                )
                return (
                    <button
                        key={emoji}
                        onClick={() => onReact(emoji)}
                        className={cn(
                            'flex items-center gap-0.5 text-sm transition-transform hover:scale-110',
                            reacted && 'opacity-100',
                            !reacted && 'opacity-70'
                        )}
                    >
                        {emoji}
                        <span className="text-xs text-muted-foreground">{count}</span>
                    </button>
                )
            })}
        </div>
    )
}