import { MessageSquare } from 'lucide-react'

export function EmptyChatScreen() {
    return (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-3 text-muted-foreground bg-muted/20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-8 h-8 opacity-40" />
            </div>
            <div className="text-center">
                <p className="font-medium text-foreground">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your existing chats or start a new one</p>
            </div>
        </div>
    )
}