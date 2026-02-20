import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

interface Theme {
    bgColor: string | null
    textColor: string | null
}

export function useConversationTheme(conversationId: string) {
    return useQuery({
        queryKey: ['theme', conversationId],
        queryFn: async () => {
            const { data } = await api.get(`/conversations/${conversationId}/theme`)
            return data.theme as Theme | null
        },
        enabled: !!conversationId,
        refetchInterval: 3000,
    })
}

export function useUpdateConversationTheme(conversationId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (theme: Partial<Theme>) => {
            const { data } = await api.patch(`/conversations/${conversationId}/theme`, theme)
            return data.theme
        },
        onSuccess: (updatedTheme) => {
            queryClient.setQueryData(['theme', conversationId], updatedTheme)
        },
    })
}