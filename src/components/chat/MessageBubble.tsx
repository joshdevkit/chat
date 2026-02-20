import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type Message, useReactToMessage } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { MessageContent } from './message/MessageContent'
import { ReactionPicker } from './message/ReactionPicker'
import { ReactionList } from './message/ReactionList'
import { ReadReceipt } from './message/ReadReceipt'
import { MessageActions } from './message/MessageActions'
import { useNavigate } from '@tanstack/react-router'
import ImageStack from './message/attachments/ImageStack'
import { Smile } from 'lucide-react'

interface SingleProps {
    message: Message
    messages?: never
    isMe: boolean
    showAvatar: boolean
    conversationId: string
    theme?: { bgColor?: string | null; textColor?: string | null } | null
    isLatest?: boolean
}

interface GroupProps {
    message?: never
    messages: Message[]
    isMe: boolean
    showAvatar: boolean
    conversationId: string
    theme?: { bgColor?: string | null; textColor?: string | null } | null
    isLatest?: boolean
}

type Props = SingleProps | GroupProps

export function MessageBubble({ message, messages, isMe, showAvatar, conversationId, theme, isLatest }: Props) {
    const [showReactions, setShowReactions] = useState(false)
    const reactMutation = useReactToMessage()
    const { user } = useAuth()
    const navigate = useNavigate()

    const isGrouped = !!messages
    const firstMsg = isGrouped ? messages[0] : message
    const isDeleted = !!firstMsg.deletedAt

    const allReactions = isGrouped
        ? messages.flatMap((m) => m.reactions)
        : message.reactions

    const latestCreatedAt = isGrouped
        ? messages[messages.length - 1].createdAt
        : message.createdAt

    const groupedReactions = allReactions.reduce(
        (acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    const handleReact = (emoji: string) => {
        reactMutation.mutate({ messageId: firstMsg.id, emoji, conversationId })
        setShowReactions(false)
    }



    const hasReactions = Object.keys(groupedReactions).length > 0

    return (
        <div className={cn('flex items-end gap-2 group', isMe && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className="w-7 shrink-0">
                {showAvatar && !isMe && (
                    <button
                        onClick={() => navigate({ to: '/profile/$userId', params: { userId: firstMsg.sender.id } })}
                    >
                        <Avatar className="w-7 h-7">
                            <AvatarImage src={firstMsg.sender.profile?.avatarUrl || ''} />
                            <AvatarFallback className="text-xs">
                                {firstMsg.sender.fullName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                )}
            </div>

            {/* Content column */}
            <div className={cn('max-w-[75%] flex flex-col gap-1', isMe && 'items-end')}>
                {showAvatar && !isMe && (
                    <p className="text-xs text-muted-foreground px-1">
                        {firstMsg.sender.fullName}
                    </p>
                )}

                {/* Bubble row */}
                <div className={cn('flex items-center gap-1', isMe ? 'flex-row-reverse' : 'flex-row')}>

                    {/* Bubble + overlapping reaction */}
                    <div className={cn('relative', hasReactions && 'mb-3')}>

                        {/* Reaction picker anchored to top of bubble */}
                        {showReactions && (
                            <ReactionPicker
                                isMe={isMe}
                                onReact={handleReact}
                                onClose={() => setShowReactions(false)}
                            />
                        )}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="cursor-pointer select-none">
                                        {isDeleted ? (
                                            <div className={cn(
                                                'px-3 py-2 rounded-2xl text-sm italic text-muted-foreground',
                                                isMe ? 'bg-muted/50 rounded-br-sm' : 'bg-muted/50 rounded-bl-sm'
                                            )}>
                                                This message was deleted
                                            </div>
                                        ) : isGrouped ? (
                                            <ImageStack messages={messages} isMe={isMe} onDoubleClick={() => { }} />
                                        ) : (
                                            <div
                                                className={cn(
                                                    'px-3 py-2 rounded-2xl text-sm wrap-break-words',
                                                    // only apply tailwind classes when no theme override
                                                    !theme?.bgColor && (isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'),
                                                    isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                                                )}
                                                style={isMe && theme?.bgColor ? {
                                                    backgroundColor: theme.bgColor,
                                                    color: theme.textColor ?? undefined,
                                                    // darken slightly for own messages to differentiate
                                                    filter: 'brightness(0.92)',
                                                } : !isMe && theme?.bgColor ? {
                                                    // other person's bubble: use a muted version of the theme
                                                    backgroundColor: theme.bgColor,
                                                    opacity: 0.6,
                                                } : undefined}
                                            >
                                                <MessageContent message={message} isMe={isMe} />
                                            </div>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side={isMe ? 'left' : 'right'}>
                                    {format(new Date(latestCreatedAt), 'PPp')}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {!isDeleted && hasReactions && (
                            <div className={cn(
                                'absolute -bottom-3',
                                isMe ? 'right-2' : 'left-2'
                            )}>
                                <ReactionList
                                    groupedReactions={groupedReactions}
                                    reactions={allReactions}
                                    currentUserId={user?.id}
                                    onReact={handleReact}
                                    isMe={isMe}
                                />
                            </div>
                        )}
                    </div>

                    {!isDeleted && (
                        <div className={cn(
                            'flex items-center gap-0.5',
                            isMe ? 'flex-row-reverse' : 'flex-row'
                        )}>
                            <button
                                onClick={() => setShowReactions((prev) => !prev)}
                                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Smile className="w-4 h-4" />
                            </button>

                            <MessageActions
                                messageId={firstMsg.id}
                                conversationId={conversationId}
                                isMe={isMe}
                                isDeleted={isDeleted}
                            />
                        </div>
                    )}
                </div>

                <ReadReceipt
                    isMe={isMe}
                    readers={isGrouped ? messages[messages.length - 1].reads : message.reads}
                    createdAt={latestCreatedAt}
                    currentUserId={user?.id}
                    showReaders={isLatest}
                />
            </div>
        </div>
    )
}