import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="flex items-center gap-3 px-3 py-3 border-b sticky top-0 bg-background/70 backdrop-blur-md z-10">
                <Skeleton className="w-9 h-9 rounded-md" />
                <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center gap-3 px-6 py-8">
                    <div className="relative">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <Skeleton className="absolute bottom-0 right-0 w-4 h-4 rounded-full" />
                    </div>

                    <div className="text-center space-y-1 flex flex-col items-center">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>

                <Separator />

                <div className="px-6 py-4 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="pt-2 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
            </div>
        </div>
    )
}