import { useState } from 'react'

export interface OnboardingFormState {
    username: string
    bio: string
    dateOfBirth?: Date
    avatarFile: File | null
    avatarPreview: string | null
    errors: Record<string, string>
}

export function useOnboardingForm() {
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const e: Record<string, string> = {}

        if (!username.trim()) e.username = 'Username is required'
        else if (username.length < 3) e.username = 'At least 3 characters'
        else if (username.length > 20) e.username = 'Max 20 characters'
        else if (!/^[a-zA-Z0-9_]+$/.test(username))
            e.username = 'Only letters, numbers and underscores'

        if (bio.length > 160) e.bio = 'Max 160 characters'

        return e
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    return {
        username,
        setUsername,
        bio,
        setBio,
        dateOfBirth,
        setDateOfBirth,
        avatarFile,
        avatarPreview,
        errors,
        setErrors,
        validate,
        handleAvatarChange,
    }
}