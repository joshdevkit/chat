import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'
import { usePresence } from '@/hooks/usePresence'
import { getConversationDisplay } from '@/hooks/useChatlist'
import { ChatListHeader } from './chatlist/ChatListHeader'
import { ChatListSkeleton } from './chatlist/ChatListSkeleton'
import { ChatListEmpty } from './chatlist/ChatListEmpty'
import { ChatListItem } from './chatlist/ChatListItem'

export function ChatListPage() {
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversations()
  const [search, setSearch] = useState('')
  usePresence()

  const filtered = (conversations || []).filter((c) => {
    const display = getConversationDisplay(c, user?.id || '')
    return display.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ChatListHeader search={search} onSearchChange={setSearch} />
      <ScrollArea className="flex-1">
        {isLoading ? (
          <ChatListSkeleton />
        ) : filtered.length === 0 ? (
          <ChatListEmpty />
        ) : (
          <div className="px-3 py-1 space-y-0.5">
            {filtered.map((conv) => (
              <ChatListItem
                key={conv.id}
                conv={conv}
                currentUserId={user?.id || ''}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}