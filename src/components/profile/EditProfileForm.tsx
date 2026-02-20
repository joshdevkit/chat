import { useState } from 'react'
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
import { useEditProfile } from '@/hooks/useEditProfile'
import type { ProfileUser } from '@/types/base'

interface Props {
    user: ProfileUser
    onCancel: () => void
    onSuccess: () => void
}

export function EditProfileForm({ user, onCancel, onSuccess }: Props) {
    const [fullName, setFullName] = useState(user.fullName)
    const [bio, setBio] = useState(user.profile?.bio || '')
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
        user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : undefined
    )
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const { submit, errors, isPending, isError, errorMessage } = useEditProfile(user, onSuccess)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submit({ fullName, bio, dateOfBirth, avatarFile })
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
                    <AvatarImage className="object-contain" src={avatarPreview || user.profile?.avatarUrl || ''} />
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
                            startMonth={new Date(1900, 0)}
                            endMonth={new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {isError && (
                <p className="text-xs text-destructive text-center">{errorMessage}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    )
}