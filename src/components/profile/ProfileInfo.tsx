import { User, Calendar } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

interface Props {
    bio?: string | null
    dateOfBirth?: string | Date | null
}

export function ProfileInfo({ bio, dateOfBirth }: Props) {
    if (!bio && !dateOfBirth) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                No additional info available.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {bio && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        <User className="w-3.5 h-3.5" />
                        Bio
                    </div>
                    <p className="text-sm leading-relaxed">{bio}</p>
                </div>
            )}

            {bio && dateOfBirth && <Separator />}

            {dateOfBirth && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        Date of Birth
                    </div>
                    <p className="text-sm">
                        {format(new Date(dateOfBirth), 'MMMM d, yyyy')}
                    </p>
                </div>
            )}
        </div>
    )
}