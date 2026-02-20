import { createFileRoute } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'

export const Route = createFileRoute('/chat/')({
  component: EmptyChat,
})

function EmptyChat() {
  return (
    <div className="hidden md:flex flex-col flex-1 items-center justify-center h-full text-muted-foreground gap-3">
      <MessageSquare className="w-12 h-12 opacity-20" />
      <p className="text-sm">Select a conversation to start chatting</p>
    </div>
  )
}