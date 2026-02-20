import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
    messageId: string
    conversationId: string
}

export function useHideMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ messageId }: Params) => {
            const { data } = await supabase.from('Message')
                .update({ hidden: true })
                .eq('id', messageId)
                .select('id, conversationId')
                .single()
            return data
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        },
    })
}