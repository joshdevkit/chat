import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

interface ProfileUser {
    id: string
    fullName: string
    profile: {
        username: string
        bio?: string | null
        avatarUrl?: string | null
        dateOfBirth?: string | null
    } | null
}

interface Props {
    user: ProfileUser
    onCancel: () => void
    onSuccess: () => void
}

export function EditProfileForm({ user, onCancel, onSuccess }: Props) {
    const queryClient = useQueryClient()
    const [fullName, setFullName] = useState(user.fullName)
    const [bio, setBio] = useState(user.profile?.bio || '')
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
        user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : undefined
    )
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const mutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData()
            formData.append('fullName', fullName)
            if (bio) formData.append('bio', bio)
            if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth.toISOString())
            if (avatarFile) formData.append('avatar', avatarFile)
            const { data } = await api.patch('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', user.id] })
            queryClient.invalidateQueries({ queryKey: ['me'] })
            onSuccess()
        },
    })

    const validate = () => {
        const e: Record<string, string> = {}
        if (!fullName.trim()) e.fullName = 'Full name is required'
        if (bio.length > 160) e.bio = 'Max 160 characters'
        return e
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setErrors({})
        mutation.mutate()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20">
                    <AvatarImage className='object-contain' src={avatarPreview || user.profile?.avatarUrl || ''} />
                    <AvatarFallback className="text-xl">{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Label
                    htmlFor="edit-avatar"
                    className="cursor-pointer text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                    <Upload className="w-3 h-3" />
                    Change photo
                </Label>
                <input
                    id="edit-avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
            </div>

            {/* Full Name */}
            <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            {/* Bio */}
            <div className="space-y-1">
                <Label htmlFor="bio">
                    Bio <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="resize-none"
                    rows={3}
                />
                <div className="flex justify-between">
                    {errors.bio
                        ? <p className="text-xs text-destructive">{errors.bio}</p>
                        : <span />
                    }
                    <p className={cn('text-xs text-muted-foreground', bio.length > 160 && 'text-destructive')}>
                        {bio.length}/160
                    </p>
                </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
                <Label>Date of Birth <span className="text-muted-foreground">(optional)</span></Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn('w-full justify-start text-left font-normal', !dateOfBirth && 'text-muted-foreground')}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, 'PPP') : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={setDateOfBirth}
                            disabled={(date) => date > new Date()}
                            autoFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {mutation.isError && (
                <p className="text-xs text-destructive text-center">
                    {(mutation.error as any)?.response?.data?.error || 'Something went wrong'}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    )
}