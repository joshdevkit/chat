import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { cn, getApiError } from '@/lib/utils'
import api from '@/lib/axios'

export default function OnboardingForm() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const mutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData()
            formData.append('username', username)
            if (bio) formData.append('bio', bio)
            if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth.toISOString())
            if (avatarFile) formData.append('avatar', avatarFile)
            const { data } = await api.post('/users/onboarding', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return data
        },
        onSuccess: () => navigate({ to: '/chat' }),
    })

    const validate = () => {
        const e: Record<string, string> = {}
        if (!username.trim()) e.username = 'Username is required'
        else if (username.length < 3) e.username = 'At least 3 characters'
        else if (username.length > 20) e.username = 'Max 20 characters'
        else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Only letters, numbers and underscores'
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
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Complete your profile</CardTitle>
                <CardDescription>Help others know who you are</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={avatarPreview || ''} />
                            <AvatarFallback className="text-2xl bg-muted">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <Label
                            htmlFor="avatar"
                            className="cursor-pointer text-sm text-primary font-medium hover:underline"
                        >
                            Upload profile photo
                        </Label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <Separator />

                    {/* Username */}
                    <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                            <Input
                                id="username"
                                className="pl-7"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                        <Label htmlFor="bio">
                            Bio <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us a little about yourself..."
                            className="resize-none"
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            {errors.bio
                                ? <p className="text-sm text-red-500">{errors.bio}</p>
                                : <span />
                            }
                            <p className={cn('text-xs text-muted-foreground', bio.length > 160 && 'text-red-500')}>
                                {bio.length}/160
                            </p>
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1 mb-3">
                        <Label>
                            Date of Birth <span className="text-muted-foreground">(optional)</span>
                        </Label>
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
                                    autoFocus={true}
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {mutation.isError && (
                        <p className="text-sm text-red-500 text-center">
                            {getApiError(mutation.error, 'Something went wrong')}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}