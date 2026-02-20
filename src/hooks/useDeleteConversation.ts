import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'


export function useDeleteConversation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (conversationId: string) => {
            const { data } = await supabase.from('Conversation')
                .delete()
                .eq('id', conversationId)
                .select('id')
                .single()
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}