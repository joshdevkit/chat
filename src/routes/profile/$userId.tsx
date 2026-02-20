import { createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft, MessageSquare, LogOut, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { isOnline } from '@/hooks/usePresence'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { useProfile } from '@/hooks/useProfile'
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'
import { ProfileNotFound } from '@/components/profile/ProfileNotFound'


export const Route = createFileRoute('/profile/$userId')({
    beforeLoad: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw redirect({ to: '/auth' })
    },
    component: ProfilePage,
})

function ProfilePage() {
    const { userId } = Route.useParams()

    const {
        profileUser,
        isLoading,
        isMe,
        editing,
        setEditing,
        handleMessage,
        logout,
        createDM,
        navigate,
    } = useProfile(userId)

    if (isLoading) {
        return <ProfileSkeleton />
    }

    if (!profileUser) {
        return <ProfileNotFound onBack={() => navigate({ to: '/chat' })} />
    }

    const online = isOnline(profileUser.lastSeenAt)

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b sticky top-0 bg-background/70 backdrop-blur-md z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/chat' })}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <p className="font-semibold text-sm flex-1">
                    {editing ? 'Edit Profile' : 'Profile'}
                </p>
                {isMe && !editing && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {editing && isMe ? (
                    <EditProfileForm
                        user={profileUser}
                        onCancel={() => setEditing(false)}
                        onSuccess={() => setEditing(false)}
                    />
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-3 px-6 py-8">
                            <ProfileAvatar
                                avatarUrl={profileUser.profile?.avatarUrl}
                                fullName={profileUser.fullName}
                                online={online}
                            />
                            <div className="text-center space-y-1">
                                <h2 className="text-xl font-bold">{profileUser.fullName}</h2>
                                {profileUser.profile?.username && (
                                    <p className="text-sm text-muted-foreground">@{profileUser.profile.username}</p>
                                )}
                                <p className={cn('text-xs font-medium', online ? 'text-green-500' : 'text-muted-foreground')}>
                                    {online ? 'Online' : 'Offline'}
                                </p>
                            </div>

                            {!isMe && (
                                <Button onClick={handleMessage} disabled={createDM.isPending} className="mt-1 gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Send Message
                                </Button>
                            )}
                        </div>

                        <Separator />

                        <div className="px-6 py-4">
                            <ProfileInfo
                                bio={profileUser.profile?.bio}
                                dateOfBirth={profileUser.profile?.dateOfBirth}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}