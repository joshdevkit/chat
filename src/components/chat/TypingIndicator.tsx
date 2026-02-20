import { useEffect } from 'react'
import { useTyping } from '@/hooks/useMessages'
import { type Conversation } from '@/hooks/useConversations'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Props {
    conversationId: string
    conversation: Conversation
    currentUserId: string
    onTypingChange?: (isTyping: boolean) => void
}

export function TypingIndicator({ conversationId, conversation, currentUserId, onTypingChange }: Props) {
    const { data: typingUserIds } = useTyping(conversationId)

    const typingParticipants = (typingUserIds ?? [])
        .filter((id) => id !== currentUserId)
        .map((id) => conversation.participants.find((p) => p.user.id === id)?.user)
        .filter(Boolean)

    const isTyping = typingParticipants.length > 0

    useEffect(() => {
        onTypingChange?.(isTyping)
    }, [isTyping, onTypingChange])

    if (!isTyping) return null

    return (
        <div className="flex items-end gap-2 px-4 py-1">
            <div className="flex items-center -space-x-2">
                {typingParticipants.map((user) => (
                    <Avatar key={user!.id} className="w-6 h-6 border-2 border-background">
                        <AvatarImage className='object-contain' src={user!.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                            {user!.fullName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>
            <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    )
}