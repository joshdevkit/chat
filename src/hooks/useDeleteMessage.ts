import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface DeleteMessageParams {
    messageId: string
    conversationId: string
}

export function useDeleteMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ messageId }: DeleteMessageParams) => {
            const { error } = await supabase
                .from('Message')
                .update({ deletedAt: new Date().toISOString() })
                .eq('id', messageId)

            if (error) throw error
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        },
    })
}