import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useCreateDM } from '@/hooks/useConversations'
import { useLogout } from '@/hooks/useLogout'
import { isOnline } from '@/hooks/usePresence'
import { supabase } from '@/lib/supabase'

export interface ProfileUser {
    id: string
    fullName: string
    lastSeenAt: string | null
    profile: {
        username: string
        bio: string | null
        avatarUrl: string | null
        dateOfBirth: string | null
    } | null
}

export function useProfile(userId: string) {
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()
    const createDM = useCreateDM()
    const logout = useLogout()
    const [editing, setEditing] = useState(false)

    const isMe = currentUser?.id === userId

    const query = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('User')
                .select(`
          id,
          fullName,
          lastSeenAt,
          profile:UserProfile (
            username,
            bio,
            avatarUrl,
            dateOfBirth
          )
        `)
                .eq('id', userId)
                .single()

            if (error) throw error

            return {
                ...data,
                profile: Array.isArray(data.profile)
                    ? data.profile[0] ?? null
                    : data.profile ?? null,
            } as ProfileUser
        },
    })

    const handleMessage = async () => {
        if (!query.data) return
        const conv = await createDM.mutateAsync(query.data.id)
        navigate({
            to: '/chat/$conversationId',
            params: { conversationId: conv.id },
        })
    }

    const online = query.data
        ? isOnline(query.data.lastSeenAt)
        : false

    return {
        profileUser: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,

        currentUser,
        isMe,
        editing,
        setEditing,

        online,
        handleMessage,

        logout,
        createDM,
        navigate,
    }
}