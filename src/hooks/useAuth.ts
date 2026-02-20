import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProfileUser } from '@/types/base'


async function fetchMe(): Promise<ProfileUser | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await supabase
        .from('User')
        .select(`
            id,
            fullName,
            email,
            profile:UserProfile (
                username,
                bio,
                avatarUrl,
                dateOfBirth
            )
            `)
        .eq('id', session.user.id)
        .single()

    if (error) throw error

    const raw = data as {
        id: string
        fullName: string
        email: string
        profile: {
            username: string
            bio: string | null
            avatarUrl: string | null
            dateOfBirth: string | null
        }[]
    }

    return {
        id: raw.id,
        fullName: raw.fullName,
        email: raw.email,
        profile: Array.isArray(raw.profile)
            ? raw.profile[0] ?? null
            : (raw.profile) ?? null,
    }
}

export function useAuth() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: fetchMe,
        retry: false,
    })

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        hasProfile: !!user?.profile,
    }
}