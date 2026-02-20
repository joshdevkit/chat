import { useRef, useEffect, useCallback } from 'react'
import { TypingIndicator } from './TypingIndicator'
import { type Message } from '@/hooks/useMessages'
import { type Conversation } from '@/hooks/useConversations'
import { MessageBubble } from './MessageBubble'
import MessageListSkeleton from './message/MessageListSkeleton'

interface Props {
    messages: Message[]
    currentUserId: string
    conversationId: string
    conversation: Conversation
    isLoading: boolean
    theme?: { bgColor?: string | null; textColor?: string | null } | null
}

function groupMessages(messages: Message[]) {
    const result: Array<{ groupId: string | null; messages: Message[] }> = []
    for (const message of messages) {
        const last = result[result.length - 1]
        if (message.groupId && last?.groupId === message.groupId) {
            last.messages.push(message)
        } else {
            result.push({ groupId: message.groupId ?? null, messages: [message] })
        }
    }
    return result
}

export function MessageList({ messages, currentUserId, conversationId, conversation, isLoading, theme }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const prevLengthRef = useRef(0)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior })
        })
    }, [])

    // scroll on new message
    useEffect(() => {
        if (!messages.length) return
        const isNewMessage = messages.length !== prevLengthRef.current
        prevLengthRef.current = messages.length
        if (isNewMessage) {
            scrollToBottom('smooth')
        }
    }, [messages, scrollToBottom])

    // scroll on conversation change
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom('instant')
        }
    }, [conversationId, scrollToBottom])

    // scroll after images/GIFs load
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleImageLoad = () => scrollToBottom('smooth')

        const images = container.querySelectorAll('img')
        images.forEach((img) => img.addEventListener('load', handleImageLoad))
        return () => images.forEach((img) => img.removeEventListener('load', handleImageLoad))
    }, [messages, scrollToBottom])

    const handleTypingChange = useCallback((isTyping: boolean) => {
        if (isTyping) scrollToBottom('smooth')
    }, [scrollToBottom])

    if (isLoading) {
        return <MessageListSkeleton />
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-end justify-center pb-4 text-muted-foreground text-sm">
                No messages yet. Say hello! 👋
            </div>
        )
    }

    const grouped = groupMessages(messages)

    return (
        <div className="flex-1 min-h-0 overflow-y-auto message-list bg-transparent">
            <div ref={containerRef} className="flex flex-col justify-end min-h-full px-3 py-4 space-y-1">
                {grouped.map((group, index) => {
                    const firstMessage = group.messages[0]
                    const isMe = firstMessage.senderId === currentUserId
                    const prevGroup = grouped[index - 1]
                    const showAvatar = !prevGroup || prevGroup.messages[0].senderId !== firstMessage.senderId
                    const isLatest = index === grouped.length - 1  // ← add

                    if (group.groupId && group.messages.length > 1) {
                        return (
                            <MessageBubble
                                key={group.groupId}
                                messages={group.messages}
                                isMe={isMe}
                                showAvatar={showAvatar}
                                conversationId={conversationId}
                                theme={theme}
                                isLatest={isLatest}  // ← add
                            />
                        )
                    }

                    return (
                        <MessageBubble
                            key={firstMessage.id}
                            message={firstMessage}
                            isMe={isMe}
                            showAvatar={showAvatar}
                            conversationId={conversationId}
                            theme={theme}
                            isLatest={isLatest}  // ← add
                        />
                    )
                })}

                <TypingIndicator
                    conversationId={conversationId}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    onTypingChange={handleTypingChange}
                />
                <div ref={bottomRef} />
            </div>
        </div>
    )
}