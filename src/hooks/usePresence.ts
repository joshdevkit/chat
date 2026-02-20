import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePresence() {
    useEffect(() => {
        const update = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await supabase
                .from('User')
                .update({ lastSeenAt: new Date().toISOString() })
                .eq('id', session.user.id)
        }

        update()
        const interval = setInterval(update, 30000)
        return () => clearInterval(interval)
    }, [])
}

export function isOnline(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false
    return Date.now() - new Date(lastSeenAt).getTime() < 35000
}