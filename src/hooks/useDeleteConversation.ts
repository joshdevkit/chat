import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

interface DeleteConversation {
    success: boolean
}


export function useDeleteConversation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (conversationId: string) => {
            const { data } = await api.delete<DeleteConversation>(`/conversations/${conversationId}`)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })
}