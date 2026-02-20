import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, LogOut, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useCreateDM } from '@/hooks/useConversations'
import { isOnline } from '@/hooks/usePresence'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'
import type { ProfileUserResponse } from '@/types/base'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { EditProfileForm } from '@/components/profile/EditProfileForm'

export const Route = createFileRoute('/profile/$userId')({
    beforeLoad: async () => {
        try {
            await api.get('/auth/me')
        } catch {
            throw redirect({ to: '/login' })
        }
    },
    component: ProfilePage,
})

function ProfilePage() {
    const { userId } = Route.useParams()
    const { user: currentUser } = useAuth()
    const navigate = useNavigate()
    const createDM = useCreateDM()
    const isMe = currentUser?.id === userId
    const [editing, setEditing] = useState(false)

    const { data: profileUser, isLoading } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const { data } = await api.get<ProfileUserResponse>(`/users/${userId}`)
            return data.user
        },
    })

    const logoutMutation = useMutation({
        mutationFn: async () => { await api.post('/auth/logout') },
        onSuccess: () => {
            queryClient.clear()
            navigate({ to: '/login' })
        },
    })

    const handleMessage = async () => {
        if (!profileUser) return
        const conv = await createDM.mutateAsync(profileUser.id)
        navigate({ to: '/chat/$conversationId', params: { conversationId: conv.id } })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-muted-foreground text-sm">
                Loading profile...
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="flex flex-col h-screen items-center justify-center text-muted-foreground text-sm">
                User not found.
                <button onClick={() => navigate({ to: '/chat' })} className="underline mt-1">Go back</button>
            </div>
        )
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
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
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
                        {/* Avatar + name section */}
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

                        {/* Info section */}
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