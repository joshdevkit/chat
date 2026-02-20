import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { isOnline } from './usePresence'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { useNavigate } from '@tanstack/react-router'

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

async function fetchConversations(): Promise<Conversation[]> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []
  const userId = session.user.id

  // get hide records for this user
  const { data: hides } = await supabase
    .from('ConversationHide')
    .select('conversationId, hiddenAt, visibleFrom')
    .eq('userId', userId)

  const trulyHidden = (hides ?? [])
    .filter((h) => !h.visibleFrom)
    .map((h) => h.conversationId)

  const visibleFromMap = new Map(
    (hides ?? [])
      .filter((h) => !!h.visibleFrom)
      .map((h) => [h.conversationId, h.visibleFrom as string])
  )

  // get conversation IDs this user participates in
  const { data: participantRows } = await supabase
    .from('Participant')
    .select('conversationId')
    .eq('userId', userId)

  const allConvIds = (participantRows ?? []).map((p) => p.conversationId)
  const visibleIds = allConvIds.filter((id) => !trulyHidden.includes(id))

  if (visibleIds.length === 0) return []

  const { data: conversations, error } = await supabase
    .from('Conversation')
    .select(`
      id,
      name,
      isGroup,
      createdAt,
      createdById,
      participants:Participant (
        user:User (
          id,
          fullName,
          lastSeenAt,
          profile:UserProfile (
            username,
            avatarUrl
          )
        )
      ),
      messages:Message (
        id,
        content,
        type,
        createdAt,
        fileName,
        sender:User!Message_senderId_fkey (
          id,
          fullName
        )
      )
    `)
    .in('id', visibleIds)
    .is('messages.deletedAt', null)
    .order('createdAt', { referencedTable: 'messages', ascending: false })
    .limit(1, { referencedTable: 'messages' })
    .order('createdAt', { ascending: false })

  if (error) throw error

  return (conversations ?? []).map((conv) => {
    const visibleFrom = visibleFromMap.get(conv.id)
    const lastMsg = conv.messages?.[0]

    const messages = visibleFrom && lastMsg && new Date(lastMsg.createdAt) < new Date(visibleFrom)
      ? []
      : (conv.messages ?? []).map((m: any) => ({
        ...m,
        sender: Array.isArray(m.sender) ? m.sender[0] : m.sender, // ← normalize sender
      }))

    return {
      ...conv,
      messages,
      unreadCount: 0,
      participants: (conv.participants ?? []).map((p: any) => ({
        user: {
          ...p.user,
          profile: Array.isArray(p.user.profile) ? p.user.profile[0] ?? null : p.user.profile ?? null,
        },
      })),
    } as unknown as Conversation
  }).sort((a, b) => {
    const aTime = a.messages[0]?.createdAt ?? a.createdAt
    const bTime = b.messages[0]?.createdAt ?? b.createdAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 3000,
  })
}

export function useCreateDM() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) navigate({ to: '/auth' })
      const userId = session?.user.id

      const { data: myParticipations } = await supabase
        .from('Participant')
        .select('conversationId')
        .eq('userId', userId)
      const myIds = (myParticipations ?? []).map((p) => p.conversationId)
      if (myIds.length > 0) {
        const { data: sharedParticipations } = await supabase
          .from('Participant')
          .select('conversationId')
          .eq('userId', targetUserId)
          .in('conversationId', myIds)  // ← only check conversations current user is in

        const sharedIds = (sharedParticipations ?? []).map((p) => p.conversationId)
        if (sharedIds.length > 0) {
          // find a non-group conversation among shared ones
          const { data: existing } = await supabase
            .from('Conversation')
            .select('id')
            .eq('isGroup', false)
            .in('id', sharedIds)
            .maybeSingle()
          if (existing) {
            // update hide record if exists — never insert participants
            await supabase
              .from('ConversationHide')
              .update({ visibleFrom: new Date().toISOString() })
              .eq('conversationId', existing.id)
              .eq('userId', userId)

            const { data: full, error } = await supabase
              .from('Conversation')
              .select(`
            id, name, isGroup, createdAt, createdById,
            participants:Participant ( user:User ( id, fullName, lastSeenAt, profile:UserProfile ( username, avatarUrl ) ) ),
            messages:Message ( id, content, type, createdAt, fileName, sender:User!Message_senderId_fkey ( id, fullName ) )
          `)
              .eq('id', existing.id)
              .single()

            if (error) throw error
            return full as unknown as Conversation
          }
        }
      }

      const { data: newConv, error } = await supabase
        .from('Conversation')
        .insert({ isGroup: false, createdById: userId })
        .select('id')
        .single()

      if (error) throw error

      const { error: participantError } = await supabase
        .from('Participant')
        .upsert([
          { conversationId: newConv.id, userId },
          { conversationId: newConv.id, userId: targetUserId },
        ], { onConflict: 'conversationId,userId' })

      if (participantError) throw participantError

      const { data: full, error: fullError } = await supabase
        .from('Conversation')
        .select(`
      id, name, isGroup, createdAt, createdById,
      participants:Participant ( user:User ( id, fullName, lastSeenAt, profile:UserProfile ( username, avatarUrl ) ) ),
      messages:Message ( id, content, type, createdAt, fileName, sender:User!Message_senderId_fkey ( id, fullName ) )
    `)
        .eq('id', newConv.id)
        .single()

      if (fullError) throw fullError
      return full as unknown as Conversation
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; memberIds: string[] }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const userId = session.user.id

      const { data: newConv, error } = await supabase
        .from('Conversation')
        .insert({ name: payload.name, isGroup: true, createdById: userId })
        .select('id')
        .single()

      if (error) throw error

      const allMembers = [...new Set([userId, ...payload.memberIds])]
      await supabase.from('Participant').insert(
        allMembers.map((uid) => ({ conversationId: newConv.id, userId: uid }))
      )

      const { data: full } = await supabase
        .from('Conversation')
        .select(`
          id, name, isGroup, createdAt, createdById,
          participants:Participant ( user:User ( id, fullName, lastSeenAt, profile:UserProfile ( username, avatarUrl ) ) ),
          messages:Message ( id, content, type, createdAt, fileName, sender:User!Message_senderId_fkey ( id, fullName ) )
        `)
        .eq('id', newConv.id)
        .single()

      return full as unknown as Conversation
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('ConversationHide')
        .upsert({
          conversationId,
          userId: session.user.id,
          hiddenAt: new Date().toISOString(),
        }, { onConflict: 'conversationId,userId' })

      if (error) throw error
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