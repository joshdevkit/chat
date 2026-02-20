import { useState } from 'react'
import { MessageCirclePlus, X, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNavigate } from '@tanstack/react-router'
import { useCreateDM } from '@/hooks/useConversations'
import { useUserSearch, getRecentSearches, saveRecentSearch, removeRecentSearch } from '@/hooks/useUserSearch'
import type { User } from '@/types/base'

export function NewDMSheet() {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [recents, setRecents] = useState<User[]>([])
    const createDM = useCreateDM()
    const navigate = useNavigate()
    const { results, isSearching, search, clear } = useUserSearch()

    const handleSearch = (q: string) => {
        setQuery(q)
        search(q)
    }

    const handleStartDM = async (user: User) => {
        saveRecentSearch(user)
        const conv = await createDM.mutateAsync(user.id)
        setOpen(false)
        clear()
        setQuery('')
        navigate({ to: '/chat/$conversationId', params: { conversationId: conv.id } })
    }

    const handleRemoveRecent = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation()
        removeRecentSearch(userId)
        setRecents(getRecentSearches())
    }

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (val) {
            // load recents when opening
            setRecents(getRecentSearches())
        } else {
            clear()
            setQuery('')
        }
    }

    const showRecents = query.length < 2 && recents.length > 0
    const showResults = query.length >= 2
    const showEmpty = showResults && !isSearching && results.length === 0

    const UserRow = ({ user, onRemove }: { user: User; onRemove?: (e: React.MouseEvent) => void }) => (
        <div
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            onClick={() => handleStartDM(user)}
        >
            <Avatar className="w-9 h-9">
                <AvatarImage src={user.profile?.avatarUrl || ''} />
                <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                {user.profile?.username && (
                    <p className="text-xs text-muted-foreground">@{user.profile.username}</p>
                )}
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="p-1 rounded-full hover:bg-muted-foreground/20 text-muted-foreground shrink-0"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <button className="py-2 px-2">
                    <MessageCirclePlus className="w-5 h-5" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4">
                <SheetHeader>
                    <SheetTitle>New Message</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                    <Input
                        placeholder="Search by name..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />

                    {showRecents && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 px-1">
                                <Clock className="w-3 h-3" /> Recent searches
                            </p>
                            {recents.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onRemove={(e) => handleRemoveRecent(e, user.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Search results */}
                    {showResults && (
                        <div className="space-y-1">
                            {isSearching && (
                                <p className="text-sm text-muted-foreground text-center py-2">Searching...</p>
                            )}
                            {showEmpty && (
                                <p className="text-sm text-muted-foreground text-center py-2">No users found</p>
                            )}
                            {results.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}