import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Conversation } from './useConversations'

export function useConversation(conversationId: string, enabled: boolean) {
    return useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Conversation')
                .select(`
          id, name, isGroup, createdAt, createdById,
          participants:Participant (
            user:User (
              id, fullName, lastSeenAt,
              profile:UserProfile ( username, avatarUrl )
            )
          ),
          messages:Message (
            id, content, type, createdAt, fileName,
            sender:User!Message_senderId_fkey ( id, fullName )
          )
        `)
                .eq('id', conversationId)
                .order('createdAt', { referencedTable: 'messages', ascending: false })
                .limit(1, { referencedTable: 'messages' })
                .single()

            if (error) throw error

            return {
                ...data,
                unreadCount: 0,
                participants: (data.participants ?? []).map((p: any) => ({
                    user: {
                        ...p.user,
                        profile: Array.isArray(p.user.profile)
                            ? p.user.profile[0] ?? null
                            : p.user.profile ?? null,
                    },
                })),
                messages: (data.messages ?? []).map((m: any) => ({
                    ...m,
                    sender: Array.isArray(m.sender) ? m.sender[0] : m.sender,
                })),
            } as unknown as Conversation
        },
        enabled,
    })
}