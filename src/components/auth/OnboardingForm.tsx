// features/onboarding/OnboardingForm.tsx
import { format } from 'date-fns'
import { CalendarIcon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle
} from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useOnboardingForm } from '@/hooks/useOnboardingForm'
import { useOnboardingMutation } from '@/hooks/useOnboardingMutation'


export default function OnboardingForm() {
    const form = useOnboardingForm()
    const mutation = useOnboardingMutation()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const errs = form.validate()
        if (Object.keys(errs).length > 0) {
            form.setErrors(errs)
            return
        }

        form.setErrors({})
        mutation.mutate({
            username: form.username,
            bio: form.bio,
            dateOfBirth: form.dateOfBirth,
            avatarFile: form.avatarFile,
        })
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                    Complete your profile
                </CardTitle>
                <CardDescription>
                    Help others know who you are
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">

                    {mutation.isError && (
                        <p className="text-sm text-red-500 text-center">
                            {(mutation.error as Error)?.message}
                        </p>
                    )}

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={form.avatarPreview || ''} />
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
                            onChange={form.handleAvatarChange}
                        />
                    </div>

                    <Separator />

                    {/* Username */}
                    <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={form.username}
                            onChange={(e) => form.setUsername(e.target.value)}
                        />
                        {form.errors.username && (
                            <p className="text-sm text-red-500">
                                {form.errors.username}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                        <Label>Bio</Label>
                        <Textarea
                            rows={3}
                            value={form.bio}
                            onChange={(e) => form.setBio(e.target.value)}
                        />
                    </div>


                    <div className="space-y-1 mb-4">
                        <Label>
                            Date of Birth <span className="text-muted-foreground">(optional)</span>
                        </Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !form.dateOfBirth && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.dateOfBirth
                                        ? format(form.dateOfBirth, 'PPP')
                                        : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={form.dateOfBirth}
                                    onSelect={form.setDateOfBirth}
                                    disabled={(date) => date > new Date()}
                                    autoFocus={true}
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}