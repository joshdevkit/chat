import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/base'

const RECENT_KEY = 'recent_dm_searches'
const MAX_RECENT = 5

export function getRecentSearches(): User[] {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    } catch {
        return []
    }
}

export function saveRecentSearch(user: User) {
    const existing = getRecentSearches().filter((u) => u.id !== user.id)
    const updated = [user, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

export function removeRecentSearch(userId: string) {
    const updated = getRecentSearches().filter((u) => u.id !== userId)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

export function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY)
}

export function useUserSearch() {
    const [results, setResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const search = async (q: string) => {
        if (q.length < 2) {
            setResults([])
            return
        }

        setIsSearching(true)
        try {
            const { data, error } = await supabase
                .from('User')
                .select(`
          id,
          fullName,
          lastSeenAt,
          profile:UserProfile ( username, avatarUrl )
        `)
                .ilike('fullName', `%${q}%`)

            if (error) throw error

            setResults((data ?? []).map((u: any) => ({
                id: u.id,
                fullName: u.fullName,
                lastSeenAt: u.lastSeenAt,
                profile: Array.isArray(u.profile) ? u.profile[0] ?? null : u.profile ?? null,
            })))
        } finally {
            setIsSearching(false)
        }
    }

    const clear = () => setResults([])

    return { results, isSearching, search, clear }
}