import { supabase } from '@/lib/supabase'
import { useRef, useCallback } from 'react'

export function useTypingIndicator(conversationId: string) {
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    const sendTyping = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const expiresAt = new Date(Date.now() + 4000).toISOString()

        const { error } = await supabase
            .from('TypingStatus')
            .upsert(
                {
                    conversationId,
                    userId: session.user.id,
                    expiresAt,
                },
                { onConflict: 'conversationId,userId' }
            )

        if (error) throw error

        if (typingTimeout.current) clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => { }, 3000)
    }, [conversationId])

    return { sendTyping }
}