import { UserX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    onBack: () => void
}

export function ProfileNotFound({ onBack }: Props) {
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b sticky top-0 bg-background/70 backdrop-blur-md z-10">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <p className="font-semibold text-sm flex-1">Profile</p>
            </div>

            <div className="flex flex-col flex-1 items-center justify-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <UserX className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-semibold text-base">User not found</h2>
                    <p className="text-sm text-muted-foreground">
                        This profile doesn't exist or may have been removed.
                    </p>
                </div>
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </Button>
            </div>
        </div>
    )
}