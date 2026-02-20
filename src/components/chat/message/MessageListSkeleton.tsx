import { Skeleton } from "@/components/ui/skeleton";

export default function MessageListSkeleton() {
    return (
        <div className="flex-1 flex flex-col justify-end px-3 py-4 space-y-3 overflow-y-auto">
            {/* receiver */}
            <div className="flex items-end gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-9 w-48 rounded-2xl rounded-bl-sm" />
            </div>

            {/* sender */}
            <div className="flex items-end gap-2 flex-row-reverse">
                <Skeleton className="h-9 w-36 rounded-2xl rounded-br-sm" />
            </div>

            {/* receiver — double */}
            <div className="flex items-end gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <div className="space-y-1">
                    <Skeleton className="h-9 w-56 rounded-2xl rounded-bl-sm" />
                    <Skeleton className="h-9 w-40 rounded-2xl" />
                </div>
            </div>

            {/* sender */}
            <div className="flex items-end gap-2 flex-row-reverse">
                <Skeleton className="h-9 w-52 rounded-2xl rounded-br-sm" />
            </div>

            {/* receiver */}
            <div className="flex items-end gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-9 w-32 rounded-2xl rounded-bl-sm" />
            </div>

            {/* sender — double */}
            <div className="flex items-end gap-2 flex-row-reverse">
                <div className="space-y-1 items-end flex flex-col">
                    <Skeleton className="h-9 w-44 rounded-2xl rounded-br-sm" />
                    <Skeleton className="h-9 w-28 rounded-2xl" />
                </div>
            </div>

            {/* receiver — wide */}
            <div className="flex items-end gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-9 w-64 rounded-2xl rounded-bl-sm" />
            </div>
        </div>
    )
}
