import type { Conversation } from "./useConversations"
import { isOnline } from "./usePresence"

export function getConversationDisplay(conv: Conversation, currentUserId: string) {
    if (conv.isGroup) {
        const firstTwo = conv.participants.slice(0, 2).map((p) => ({
            avatarUrl: p.user.profile?.avatarUrl || null,
            initials: (p.user.fullName || 'U').slice(0, 2).toUpperCase(),
        }))
        return {
            name: conv.name || 'Group Chat',
            avatarUrl: null,
            initials: (conv.name || 'G').slice(0, 2).toUpperCase(),
            online: false,
            groupAvatars: firstTwo,
        }
    }
    const other = conv.participants.find((p) => p.user.id !== currentUserId)?.user
    return {
        name: other?.fullName || 'Unknown',
        avatarUrl: other?.profile?.avatarUrl || null,
        initials: (other?.fullName || 'U').slice(0, 2).toUpperCase(),
        online: isOnline(other?.lastSeenAt || null),
        groupAvatars: null,
    }
}

export type LastMessagePreview = {
    prefix: string
    text: string
    icon: 'image' | 'file' | 'gif' | 'mic' | null
}

export function getLastMessagePreview(conv: Conversation, currentUserId: string): LastMessagePreview {
    const last = conv.messages[0]
    if (!last) return { prefix: '', text: 'No messages yet', icon: null }

    const isMe = last.sender.id === currentUserId
    const prefix = isMe ? 'You' : last.sender.fullName.split(' ')[0]

    if (last.type === 'IMAGE') return { prefix, text: 'Photo', icon: 'image' }
    if (last.type === 'FILE' && last.content?.includes('giphy.com')) return { prefix, text: 'GIF', icon: 'gif' }
    if (last.type === 'FILE' && last.fileName?.endsWith('.webm')) return { prefix, text: 'Voice message', icon: 'mic' }
    if (last.type === 'FILE') return { prefix, text: last.fileName || 'File', icon: 'file' }
    if (last.content?.includes('giphy.com')) return { prefix, text: 'GIF', icon: 'gif' }

    const text = last.content || ''
    return { prefix, text: text.length > 28 ? `${text.slice(0, 28)}...` : text, icon: null }
}

export function getUnreadCount(conv: Conversation): number {
    return conv.unreadCount ?? 0
}