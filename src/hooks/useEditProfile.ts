import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProfileUser } from '@/types/base'

export interface EditProfileValues {
    fullName: string
    bio: string
    dateOfBirth: Date | undefined
    avatarFile: File | null
}

async function uploadAvatar(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(path)

    return publicUrl
}

export function useEditProfile(user: ProfileUser, onSuccess: () => void) {
    const queryClient = useQueryClient()
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (values: EditProfileValues) => {
        const e: Record<string, string> = {}
        if (!values.fullName.trim()) e.fullName = 'Full name is required'
        if (values.bio.length > 160) e.bio = 'Max 160 characters'
        return e
    }

    const mutation = useMutation({
        mutationFn: async (values: EditProfileValues) => {
            const { data: { session } } = await supabase.auth.getSession()
            const userId = session?.user.id
            if (!userId) throw new Error('Not authenticated')

            let avatarUrl: string | undefined

            if (values.avatarFile) {
                avatarUrl = await uploadAvatar(values.avatarFile, userId)
            }

            if (values.fullName !== user.fullName) {
                const { error } = await supabase
                    .from('User')
                    .update({ fullName: values.fullName })
                    .eq('id', userId)

                if (error) throw error
            }

            const { error } = await supabase
                .from('UserProfile')
                .update({
                    bio: values.bio || null,
                    dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
                    ...(avatarUrl && { avatarUrl }),
                    updatedAt: new Date().toISOString(),
                })
                .eq('userId', userId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', user.id] })
            queryClient.invalidateQueries({ queryKey: ['me'] })
            onSuccess()
        },
    })

    const submit = (values: EditProfileValues) => {
        const errs = validate(values)
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            return
        }
        setErrors({})
        mutation.mutate(values)
    }

    return {
        submit,
        errors,
        isPending: mutation.isPending,
        isError: mutation.isError,
        errorMessage: (mutation.error as Error)?.message || 'Something went wrong',
    }
}