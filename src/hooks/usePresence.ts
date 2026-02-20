import { useEffect } from 'react'
import api from '@/lib/axios'

export function usePresence() {
    useEffect(() => {
        const update = () => api.patch('/messages/presence').catch(() => { })
        update()
        const interval = setInterval(update, 30000)
        return () => clearInterval(interval)
    }, [])
}

export function isOnline(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false
    return Date.now() - new Date(lastSeenAt).getTime() < 35000
}