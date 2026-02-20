import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface RegisterInput {
    fullName: string
    email: string
    password: string
}

export function useRegister() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ fullName, email, password }: RegisterInput) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { fullName },
                },
            })
            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
    })
}