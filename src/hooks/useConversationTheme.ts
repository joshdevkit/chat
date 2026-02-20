import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface Theme {
    bgColor: string | null
    textColor: string | null
}

export function useConversationTheme(conversationId: string) {
    return useQuery({
        queryKey: ['theme', conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ConversationTheme')
                .select('bgColor, textColor')
                .eq('conversationId', conversationId)
                .maybeSingle()

            if (error) throw error
            return data as Theme | null
        },
        enabled: !!conversationId,
        refetchInterval: 3000,
    })
}

export function useUpdateConversationTheme(conversationId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (theme: Partial<Theme>) => {
            const { data, error } = await supabase
                .from('ConversationTheme')
                .upsert({
                    conversationId,
                    ...theme,
                    updatedAt: new Date().toISOString(),
                }, { onConflict: 'conversationId' })
                .select('bgColor, textColor')
                .single()

            if (error) throw error
            return data as Theme
        },
        onSuccess: (updatedTheme) => {
            queryClient.setQueryData(['theme', conversationId], updatedTheme)
        },
    })
}