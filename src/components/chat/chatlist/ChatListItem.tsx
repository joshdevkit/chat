import { useNavigate, useMatchRoute } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Image, FileText, Mic, Clapperboard } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { type Conversation } from '@/hooks/useConversations'
import { getConversationDisplay, getLastMessagePreview, getUnreadCount } from '@/hooks/useChatlist'
import { ConversationActions } from '../ConversationActions'

const iconMap = {
    image: <Image className="w-3 h-3 shrink-0" />,
    file: <FileText className="w-3 h-3 shrink-0" />,
    gif: <Clapperboard className="w-3 h-3 shrink-0" />,
    mic: <Mic className="w-3 h-3 shrink-0" />,
}

interface Props {
    conv: Conversation
    currentUserId: string
}

export function ChatListItem({ conv, currentUserId }: Props) {
    const navigate = useNavigate()
    const matchRoute = useMatchRoute()

    const display = getConversationDisplay(conv, currentUserId)
    const preview = getLastMessagePreview(conv, currentUserId)
    const unread = getUnreadCount(conv)
    const lastTime = conv.messages[0]
        ? formatDistanceToNow(new Date(conv.messages[0].createdAt), { addSuffix: false })
        : ''
    const isActive = !!matchRoute({
        to: '/chat/$conversationId',
        params: { conversationId: conv.id },
    })

    return (
        <div
            onClick={() => navigate({ to: '/chat/$conversationId', params: { conversationId: conv.id } })}
            className={cn(
                'group/conv w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left cursor-pointer',
                isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0 w-14 h-14">
                {display.groupAvatars ? (
                    <div className="relative w-14 h-14">
                        <Avatar className="absolute top-0 left-0 w-9 h-9 border-2 border-background">
                            <AvatarImage className="object-contain" src={display.groupAvatars[0]?.avatarUrl || ''} />
                            <AvatarFallback className="text-xs font-semibold bg-muted">
                                {display.groupAvatars[0]?.initials}
                            </AvatarFallback>
                        </Avatar>
                        <Avatar className="absolute bottom-0 right-0 w-9 h-9 border-2 border-background">
                            <AvatarImage className="object-contain" src={display.groupAvatars[1]?.avatarUrl || ''} />
                            <AvatarFallback className="text-xs font-semibold bg-muted">
                                {display.groupAvatars[1]?.initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                ) : (
                    <>
                        <Avatar className="w-14 h-14">
                            <AvatarImage className="object-contain" src={display.avatarUrl || ''} />
                            <AvatarFallback className="text-base font-semibold bg-muted">
                                {display.initials}
                            </AvatarFallback>
                        </Avatar>
                        {display.online && (
                            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                        )}
                    </>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className={cn(
                        'text-sm truncate',
                        isActive ? 'font-bold text-primary' : unread > 0 ? 'font-bold' : 'font-semibold'
                    )}>
                        {display.name}
                    </p>
                    {lastTime && (
                        <span className={cn(
                            'text-[11px] shrink-0 tabular-nums',
                            isActive ? 'text-primary/70' : unread > 0 ? 'text-primary font-medium' : 'text-muted-foreground'
                        )}>
                            {lastTime}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className={cn(
                        'flex items-center gap-1 text-xs truncate leading-relaxed',
                        unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                        <span className="shrink-0 font-medium">{preview.prefix}:</span>
                        {preview.icon && iconMap[preview.icon]}
                        <span className="truncate">{preview.text}</span>
                    </div>
                    {unread > 0 && !isActive && (
                        <span className="shrink-0 min-w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </div>
            </div>

            <ConversationActions conversationId={conv.id} />
        </div>
    )
}