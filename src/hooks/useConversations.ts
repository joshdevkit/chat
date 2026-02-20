import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { isOnline } from './usePresence'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

export interface ConversationUser {
    id: string
    fullName: string
    lastSeenAt: string | null
    profile: { username: string; avatarUrl: string | null } | null
}

export interface LastMessage {
    id: string
    content: string | null
    type: string
    createdAt: string
    fileName?: string
    sender: { id: string; fullName: string }
}

export interface Conversation {
    id: string
    name: string | null
    isGroup: boolean
    createdAt: string
    createdById: string
    participants: { user: ConversationUser }[]
    messages: LastMessage[]
    unreadCount: number
}

export function useConversations() {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data } = await api.get('/conversations')
            return data.conversations as Conversation[]
        },
        refetchInterval: 3000,
    })
}

export function useCreateDM() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (targetUserId: string) => {
            const { data } = await api.post('/conversations/dm', { targetUserId })
            return data.conversation as Conversation
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    })
}

export function useCreateGroup() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { name: string; memberIds: string[] }) => {
            const { data } = await api.post('/conversations/group', payload)
            return data.conversation as Conversation
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    })
}


export function getConversationInfo(conv: Conversation, currentUserId: string) {
    if (conv.isGroup) {
        return {
            name: conv.name || 'Group Chat',
            avatarUrl: null,
            initials: (conv.name || 'G').slice(0, 2).toUpperCase(),
            subtitle: `${conv.participants.length} members`,
            online: false,
        }
    }
    const other = conv.participants.find((p) => p.user.id !== currentUserId)?.user
    const online = isOnline(other?.lastSeenAt || null)
    return {
        id: other?.id || '',
        name: other?.fullName || 'Unknown',
        avatarUrl: other?.profile?.avatarUrl || null,
        initials: (other?.fullName || 'U').slice(0, 2).toUpperCase(),
        subtitle: online
            ? 'Online'
            : other?.lastSeenAt
                ? `Last seen ${formatDistanceToNow(new Date(other.lastSeenAt), { addSuffix: true })}`
                : 'Offline',
        online,
    }
}