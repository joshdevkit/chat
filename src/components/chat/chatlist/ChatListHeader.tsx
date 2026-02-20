import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NewDMSheet } from '../NewDMSheet'
import { NewGroupDialog } from '../NewGroupDialog'
import { useAuth } from '@/hooks/useAuth'
import { ModeToggle } from '@/components/mode-toggle'

interface Props {
    search: string
    onSearchChange: (value: string) => void
}

export function ChatListHeader({ search, onSearchChange }: Props) {
    const { user } = useAuth()
    const navigate = useNavigate()
    return (
        <>
            <div className="px-5 pt-5 pb-3 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate({ to: '/profile/$userId', params: { userId: user?.id || '' } })}
                            className="relative"
                        >
                            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                                <AvatarImage className="object-contain" src={user?.profile?.avatarUrl || ''} />
                                <AvatarFallback className="text-sm font-semibold">
                                    {user?.fullName?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <ModeToggle />
                        <NewDMSheet />
                        <NewGroupDialog />
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:bg-muted transition-all"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </>
    )
}