import { useState } from 'react'
import { MessageCirclePlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNavigate } from '@tanstack/react-router'
import api from '@/lib/axios'
import { useCreateDM } from '@/hooks/useConversations'
import type { SearchResponse, User } from '@/types/base'

export function NewDMSheet() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<User[]>([])
    const [open, setOpen] = useState(false)
    const createDM = useCreateDM()
    const navigate = useNavigate()

    const handleSearch = async (q: string) => {
        setQuery(q)
        if (q.length < 2) { setResults([]); return }
        const { data } = await api.get<SearchResponse>(`/users/search?q=${q}`)
        setResults(data.users)
    }

    const handleStartDM = async (userId: string) => {
        const conv = await createDM.mutateAsync(userId)
        setOpen(false)
        navigate({ to: '/chat/$conversationId', params: { conversationId: conv.id } })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="py-2 px-2">
                    <MessageCirclePlus className="w-5 h-5" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-4">
                <SheetHeader>
                    <SheetTitle>New Message</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-5">
                    <Input
                        placeholder="Search by name or username..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <div className="space-y-1">
                        {results.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleStartDM(user.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <Avatar className="w-9 h-9">
                                    <AvatarImage src={user.profile?.avatarUrl || ''} />
                                    <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{user.fullName}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}