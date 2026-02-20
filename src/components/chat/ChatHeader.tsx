import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getConversationInfo, type Conversation } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'
import { ConversationAttachmentsSheet } from './ConversationAttachmentsSheet'


interface Props {
    conversation: Conversation
    currentUserId: string
    actions?: React.ReactNode
}


export function ChatHeader({ conversation, currentUserId, actions }: Props) {
    const navigate = useNavigate()
    const info = getConversationInfo(conversation, currentUserId)
    return (
        <div className={cn(
            'sticky top-0 z-20 flex items-center gap-3 px-3 py-3',
            'bg-inherit backdrop-blur-md',
            'border-b border-border/50 shadow-sm'
        )}>
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => navigate({ to: '/chat' })}
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="relative">
                {info.id ? (
                    <Link to="/profile/$userId" params={{ userId: info.id }}>
                        <Avatar className="w-9 h-9">
                            <AvatarImage className='object-contain' src={info.avatarUrl || ''} />
                            <AvatarFallback>{info.initials}</AvatarFallback>
                        </Avatar>
                        {info.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                        )}
                    </Link>
                ) : (
                    <Avatar className="w-9 h-9">
                        <AvatarImage src={info.avatarUrl || ''} />
                        <AvatarFallback>{info.initials}</AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{info.name}</p>
                <p className={cn('text-xs', info.online ? 'text-green-500' : 'text-muted-foreground')}>
                    {info.subtitle}
                </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
                {actions}
                <ConversationAttachmentsSheet conversationId={conversation.id} />
            </div>
        </div>
    )
}