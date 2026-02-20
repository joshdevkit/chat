import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface User {
    id: string
    fullName: string
    email: string
    profile: {
        username: string
        bio: string | null
        avatarUrl: string | null
        dateOfBirth: string | null
    } | null
}

async function fetchMe(): Promise<User> {
    const { data } = await api.get('/auth/me')
    return data.user
}

export function useAuth() {
    const { data: user, isLoading, isError } = useQuery({
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