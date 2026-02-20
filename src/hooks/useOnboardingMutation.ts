// features/onboarding/useOnboardingMutation.ts
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface OnboardingPayload {
    username: string
    bio: string
    dateOfBirth?: Date
    avatarFile: File | null
}

export function useOnboardingMutation() {
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async ({
            username,
            bio,
            dateOfBirth,
            avatarFile,
        }: OnboardingPayload) => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) throw new Error('Unauthorized')

            const userId = session.user.id
            let avatarUrl: string | null = null

            if (avatarFile) {
                const ext = avatarFile.name.split('.').pop()
                const path = `avatars/${userId}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('chat-files')
                    .upload(path, avatarFile, { upsert: true })

                if (uploadError) throw uploadError

                const {
                    data: { publicUrl },
                } = supabase.storage.from('chat-files').getPublicUrl(path)

                avatarUrl = publicUrl
            }

            const { error } = await supabase.from('UserProfile').insert({
                userId,
                username,
                bio: bio || null,
                dateOfBirth: dateOfBirth
                    ? dateOfBirth.toISOString()
                    : null,
                avatarUrl,
            })

            if (error) throw error
        },
        onSuccess: () => navigate({ to: '/chat' }),
    })
}