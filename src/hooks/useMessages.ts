import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

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

async function fetchMessages(conversationId: string): Promise<Message[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return []
    const userId = session.user.id

    // check visibleFrom
    const { data: hideRecord } = await supabase
        .from('ConversationHide')
        .select('visibleFrom')
        .eq('conversationId', conversationId)
        .eq('userId', userId)
        .maybeSingle()

    // get hidden message ids
    const { data: hiddenMessages } = await supabase
        .from('MessageHide')
        .select('messageId')
        .eq('userId', userId)

    const hiddenIds = (hiddenMessages ?? []).map((h) => h.messageId)

    let query = supabase
        .from('Message')
        .select(`
    id,
    conversationId,
    senderId,
    content,
    type,
    groupId,
    fileUrl,
    fileName,
    fileSize,
    deletedAt,
    createdAt,
    sender:User!Message_senderId_fkey (
      id,
      fullName,
      profile:UserProfile ( username, avatarUrl )
    ),
    reads:MessageRead (
      userId,
      readAt,
      user:User (
        fullName,
        profile:UserProfile ( avatarUrl )
      )
    ),
    reactions:MessageReaction ( userId, emoji )
  `)
        .eq('conversationId', conversationId)
        .order('createdAt', { ascending: true })

    if (hiddenIds.length > 0) {
        query = query.not('id', 'in', `(${hiddenIds.join(',')})`)
    }

    if (hideRecord?.visibleFrom) {
        query = query.gte('createdAt', hideRecord.visibleFrom)
    }

    const { data, error } = await query
    if (error) throw error

    // mark unread messages as read
    const unread = (data ?? []).filter(
        (m) => m.senderId !== userId && !m.reads.some((r) => r.userId === userId)
    )
    if (unread.length > 0) {
        await supabase.from('MessageRead').upsert(
            unread.map((m) => ({ messageId: m.id, userId })),
            { onConflict: 'messageId,userId' }
        )
    }

    return (data ?? []).map((m): Message => {
        const senderRaw = Array.isArray(m.sender) ? m.sender[0] : m.sender
        return {
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            content: m.content,
            type: m.type as Message['type'],
            groupId: m.groupId,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            fileSize: m.fileSize,
            deletedAt: m.deletedAt,
            createdAt: m.createdAt,
            sender: {
                id: senderRaw.id,
                fullName: senderRaw.fullName,
                profile: Array.isArray(senderRaw.profile)
                    ? senderRaw.profile[0] ?? null
                    : senderRaw.profile ?? null,
            },
            reads: (m.reads ?? []).map((r) => {
                const readUser = Array.isArray(r.user) ? r.user[0] : r.user
                const readProfile = Array.isArray(readUser?.profile) ? readUser.profile[0] : readUser?.profile
                return {
                    userId: r.userId,
                    readAt: r.readAt,
                    user: readUser ? {
                        fullName: readUser.fullName,
                        profile: readProfile ?? null,
                    } : undefined,
                }
            }),
            reactions: (m.reactions ?? []).map((r) => ({
                userId: r.userId,
                emoji: r.emoji,
            })),
        }
    })
}

export function useMessages(conversationId: string) {
    return useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => fetchMessages(conversationId),
        refetchInterval: 3000,
        enabled: !!conversationId,
    })
}

export function useSendMessage(conversationId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { content?: string; files?: File[] }) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')
            const userId = session.user.id

            const messages = []
            const groupId = payload.files && payload.files.length > 0
                ? crypto.randomUUID()
                : undefined

            if (payload.files && payload.files.length > 0) {
                for (const file of payload.files) {
                    const ext = file.name.split('.').pop()
                    const path = `messages/${crypto.randomUUID()}.${ext}`

                    const { error: uploadError } = await supabase.storage
                        .from('chat-files')
                        .upload(path, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('chat-files')
                        .getPublicUrl(path)

                    const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE'

                    const { data: msg, error } = await supabase
                        .from('Message')
                        .insert({
                            conversationId,
                            senderId: userId,
                            type,
                            fileUrl: publicUrl,
                            fileName: file.name,
                            fileSize: file.size,
                            groupId,
                        })
                        .select(`
              id, conversationId, senderId, content, type, groupId,
              fileUrl, fileName, fileSize, deletedAt, createdAt,
              sender:User!Message_senderId_fkey ( id, fullName, profile:UserProfile ( username, avatarUrl ) ),
              reads:MessageRead ( userId, readAt ),
              reactions:MessageReaction ( userId, emoji )
            `)
                        .single()

                    if (error) throw error
                    messages.push(msg)
                }
            }

            if (payload.content?.trim()) {
                const { data: msg, error } = await supabase
                    .from('Message')
                    .insert({
                        conversationId,
                        senderId: userId,
                        content: payload.content.trim(),
                        type: 'TEXT',
                        groupId,
                    })
                    .select(`
            id, conversationId, senderId, content, type, groupId,
            fileUrl, fileName, fileSize, deletedAt, createdAt,
            sender:User!Message_senderId_fkey ( id, fullName, profile:UserProfile ( username, avatarUrl ) ),
            reads:MessageRead ( userId, readAt ),
            reactions:MessageReaction ( userId, emoji )
          `)
                    .single()

                if (error) throw error
                messages.push(msg)
            }

            // update visibleFrom if hide record exists with no visibleFrom
            if (messages.length > 0) {
                await supabase
                    .from('ConversationHide')
                    .update({ visibleFrom: messages[0].createdAt })
                    .eq('conversationId', conversationId)
                    .eq('userId', userId)
                    .is('visibleFrom', null)
            }

            return messages
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
    })
}

export function useReactToMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string; conversationId: string }) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')
            const userId = session.user.id

            const { data: existing } = await supabase
                .from('MessageReaction')
                .select('id')
                .eq('messageId', messageId)
                .eq('userId', userId)
                .eq('emoji', emoji)
                .maybeSingle()

            if (existing) {
                await supabase.from('MessageReaction').delete()
                    .eq('messageId', messageId)
                    .eq('userId', userId)
                    .eq('emoji', emoji)
                return { removed: true }
            } else {
                await supabase.from('MessageReaction').insert({ messageId, userId, emoji })
                return { added: true }
            }
        },
        onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
    })
}

export function useDeleteMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ messageId }: { messageId: string; conversationId: string }) => {
            const { error } = await supabase
                .from('Message')
                .update({ deletedAt: new Date().toISOString() })
                .eq('id', messageId)

            if (error) throw error
        },
        onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
    })
}

export function useHideMessage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ messageId }: { messageId: string; conversationId: string }) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('MessageHide')
                .upsert({ messageId, userId: session.user.id }, { onConflict: 'messageId,userId' })

            if (error) throw error
        },
        onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
    })
}

export function useTyping(conversationId: string) {
    return useQuery({
        queryKey: ['typing', conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('TypingStatus')
                .select('userId')
                .eq('conversationId', conversationId)
                .gt('expiresAt', new Date().toISOString())

            if (error) throw error
            return (data ?? []).map((t) => t.userId) as string[]
        },
        refetchInterval: 2000,
        enabled: !!conversationId,
    })
}