import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type Message } from '@/hooks/useMessages'
import { PreviewImage } from './message/PreviewImage'
import { ReadReceipt } from './message/ReadReceipt'
import { cn } from '@/lib/utils'

interface Props {
    messages: Message[]
    isMe: boolean
    showAvatar: boolean
    conversationId: string
}

export function GroupedMessage({ messages, isMe, showAvatar }: Props) {
    const sender = messages[0].sender
    const lastMessage = messages[messages.length - 1]

    const imageMessages = messages.filter((m) => m.type === 'IMAGE')
    const textMessage = messages.find((m) => m.type === 'TEXT')

    return (
        <div className={cn('flex items-end gap-2', isMe && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className="w-7 shrink-0">
                {showAvatar && !isMe && (
                    <Avatar className="w-7 h-7">
                        <AvatarImage src={sender.profile?.avatarUrl || ''} />
                        <AvatarFallback className="text-xs">
                            {sender.fullName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            {/* Content */}
            <div className={cn('max-w-[75%] space-y-1', isMe && 'items-end flex flex-col')}>
                {/* Sender name */}
                {showAvatar && !isMe && (
                    <p className="text-xs text-muted-foreground px-1">{sender.fullName}</p>
                )}

                {/* Image grid */}
                {imageMessages.length > 0 && (
                    <div className={cn(
                        'grid gap-1 rounded-2xl overflow-hidden',
                        imageMessages.length === 1 && 'grid-cols-1',
                        imageMessages.length === 2 && 'grid-cols-2',
                        imageMessages.length >= 3 && 'grid-cols-3',
                    )}>
                        {imageMessages.map((m) => (
                            <PreviewImage
                                key={m.id}
                                src={m.fileUrl!}
                                alt="Image"
                                className="w-full h-28 object-cover"
                            />
                        ))}
                    </div>
                )}

                {/* Caption text */}
                {textMessage?.content && (
                    <div className={cn(
                        'px-3 py-2 rounded-2xl text-sm wrap-break-words',
                        isMe
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                    )}>
                        {textMessage.content}
                    </div>
                )}

                {/* Read receipt */}
                <ReadReceipt
                    isMe={isMe}
                    readCount={lastMessage.reads.length}
                    createdAt={lastMessage.createdAt}
                />
            </div>
        </div>
    )
}