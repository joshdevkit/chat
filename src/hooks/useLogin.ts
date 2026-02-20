import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface LoginInput {
    email: string
    password: string
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ email, password }: LoginInput) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
    })
}