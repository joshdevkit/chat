import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

interface DeleteMessageParams {
    messageId: string
    conversationId: string
}

interface DeleteResponse {
    success: boolean
}

export function useDeleteMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ messageId }: DeleteMessageParams) => {
            const { data } = await api.delete<DeleteResponse>(`/messages/${messageId}`)
            return data
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        },
    })
}