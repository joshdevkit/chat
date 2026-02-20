import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface MessageSender {
    id: string
    fullName: string
    profile: { username: string; avatarUrl: string | null } | null
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string | null
    type: 'TEXT' | 'IMAGE' | 'FILE'
    groupId?: string | null
    fileUrl: string | null
    fileName: string | null
    fileSize: number | null
    deletedAt: string | null
    createdAt: string
    sender: MessageSender
    reads: { userId: string; readAt: string }[]
    reactions: { userId: string; emoji: string }[]
}

export function useMessages(conversationId: string) {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            const { data } = await api.get(`/messages/${conversationId}`)
            return data.messages as Message[]
        },
        refetchInterval: 3000,
        enabled: !!conversationId,
    })
}
export function useSendMessage(conversationId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { content?: string; files?: File[] }) => {
            const formData = new FormData()
            if (payload.content) formData.append('content', payload.content)
            if (payload.files) {
                payload.files.forEach((file) => formData.append('files', file))
            }
            const { data } = await api.post(`/messages/${conversationId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return data.messages
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
    })
}

export function useReactToMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string; conversationId: string }) => {
            const { data } = await api.post(`/messages/${messageId}/react`, { emoji })
            return data
        },
        onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
    })


}

export function useTyping(conversationId: string) {
    return useQuery({
        queryKey: ['typing', conversationId],
        queryFn: async () => {
            const { data } = await api.get(`/messages/${conversationId}/typing`)
            return data.typingUsers as string[]
        },
        refetchInterval: 2000,
        enabled: !!conversationId,
    })
}