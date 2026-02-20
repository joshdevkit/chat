export function ChatListSkeleton() {
    return (
        <div className="space-y-1 px-3 pt-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl">
                    <div className="w-14 h-14 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-muted animate-pulse rounded-full w-1/3" />
                        <div className="h-3 bg-muted animate-pulse rounded-full w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    )
}