import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
    avatarUrl?: string | null
    fullName: string
    online: boolean
    size?: 'sm' | 'lg'
}

export function ProfileAvatar({ avatarUrl, fullName, online, size = 'lg' }: Props) {
    return (
        <div className="relative">
            <Avatar className={cn(
                'ring-4 ring-background shadow-lg',
                size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'
            )}>
                <AvatarImage className='object-contain' src={avatarUrl || ''} />
                <AvatarFallback className={size === 'lg' ? 'text-2xl' : 'text-lg'}>
                    {fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            {online && (
                <span className={cn(
                    'absolute bg-green-500 rounded-full border-2 border-background',
                    size === 'lg' ? 'bottom-1 right-1 w-4 h-4' : 'bottom-0.5 right-0.5 w-3 h-3'
                )} />
            )}
        </div>
    )
}