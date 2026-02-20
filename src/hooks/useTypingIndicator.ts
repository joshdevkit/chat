import { useRef, useCallback } from 'react'
import api from '@/lib/axios'

export function useTypingIndicator(conversationId: string) {
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const sendTyping = useCallback(() => {
        api.post(`/messages/${conversationId}/typing`).catch(() => { })
        if (typingTimeout.current) clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => { }, 3000)
    }, [conversationId])

    return { sendTyping }
}