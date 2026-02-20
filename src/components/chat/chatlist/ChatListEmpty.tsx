import { MessageSquare } from 'lucide-react'

export function ChatListEmpty() {
    return (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground px-6">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-6 h-6 opacity-40" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-0.5 opacity-70">Start a new message or group chat</p>
            </div>
        </div>
    )
}