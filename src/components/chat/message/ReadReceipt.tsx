import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Reader {
    userId: string
    user?: {
        profile?: { avatarUrl?: string | null } | null
        fullName?: string
    }
}
interface Props {
    isMe: boolean
    readers: Reader[]
    createdAt: string
    currentUserId?: string
    showReaders?: boolean
}

export function ReadReceipt({ isMe, readers, createdAt, currentUserId, showReaders = false }: Props) {
    const otherReaders = readers.filter((r) => r.userId !== currentUserId)

    return (
        <div className={cn('flex items-center gap-1 px-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
            <span className="text-[10px] text-muted-foreground">
                {format(new Date(createdAt), 'HH:mm')}
            </span>

            {isMe && showReaders && otherReaders.length === 0 && (
                <span className="text-[10px] text-muted-foreground">✓</span>
            )}

            {isMe && showReaders && otherReaders.length > 0 && (
                <div className="flex items-center -space-x-1">
                    {otherReaders.slice(0, 3).map((r) => (
                        <Avatar key={r.userId} className="w-3.5 h-3.5 border border-background">
                            <AvatarImage src={r.user?.profile?.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[8px]">
                                {r.user?.fullName?.charAt(0).toUpperCase() ?? '?'}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {otherReaders.length > 3 && (
                        <span className="text-[10px] text-muted-foreground pl-1.5">
                            +{otherReaders.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}