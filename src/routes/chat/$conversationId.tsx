import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getConversationInfo, useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { usePresence } from '@/hooks/usePresence'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageList } from '@/components/chat/MessageList'
import { MessageInput } from '@/components/chat/MessageInput'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Conversation } from '@/hooks/useConversations'
import { Header } from '@/components/PageHead'
import { useConversationTheme } from '@/hooks/useConversationTheme'
import { ThemePicker } from '@/components/chat/ThemePicker'

export const Route = createFileRoute('/chat/$conversationId')({
    component: ChatPage,
})

function ChatPage() {
    const { conversationId } = Route.useParams()
    const { user } = useAuth()
    const { data: conversations, isLoading: isConvsLoading } = useConversations()
    const { data: messages = [], isLoading: isMsgsLoading } = useMessages(conversationId)
    const navigate = useNavigate()
    usePresence()

    const conversation = conversations?.find((c) => c.id === conversationId)
    const { data: directConv, isLoading: isDirectLoading } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            const { data } = await api.get<{ conversation: Conversation }>(`/conversations/${conversationId}`)
            return data.conversation
        },
        enabled: !isConvsLoading && !conversation,
    })

    const { data: theme } = useConversationTheme(conversationId)

    const resolvedConversation = conversation ?? directConv
    const isLoading = isConvsLoading || (!conversation && isDirectLoading)

    const receiverName = resolvedConversation
        ? resolvedConversation.isGroup
            ? resolvedConversation.name || 'Group Chat'
            : getConversationInfo(resolvedConversation, user?.id || '').name
        : ''

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground text-sm">
                Loading...
            </div>
        )
    }

    if (!resolvedConversation) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground text-sm">
                Conversation not found.{' '}
                <button onClick={() => navigate({ to: '/chat' })} className="underline mt-1">
                    Go back
                </button>
            </div>
        )
    }

    return (
        <>
            <div
                className="flex flex-col h-full transition-colors duration-300"
                style={{
                    backgroundColor: theme?.bgColor ?? undefined,
                    color: theme?.textColor ?? undefined,
                }}
            >
                <Header title={receiverName} />
                <div className="flex flex-col h-full">
                    <ChatHeader conversation={resolvedConversation}
                        currentUserId={user?.id || ''}
                        actions={
                            !resolvedConversation.isGroup && (
                                <ThemePicker
                                    conversationId={conversationId}
                                    currentBg={theme?.bgColor ?? null}
                                    currentText={theme?.textColor ?? null}
                                />
                            )
                        }
                    />
                    <MessageList
                        messages={messages}
                        currentUserId={user?.id || ''}
                        conversationId={conversationId}
                        conversation={resolvedConversation}
                        isLoading={isMsgsLoading}
                        theme={theme ?? null}
                    />
                    <MessageInput conversationId={conversationId} />
                </div>
            </div>
        </>
    )
}