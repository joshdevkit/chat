import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

interface Params {
    messageId: string
    conversationId: string
}

export function useHideMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ messageId }: Params) => {
            const { data } = await api.post(`/messages/${messageId}/hide`)
            return data
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        },
    })
}