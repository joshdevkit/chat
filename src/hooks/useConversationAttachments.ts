import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface Attachment {
    id: string
    fileUrl: string
    fileName: string | null
    type: string
    createdAt: string
    sender: { id: string; fullName: string }
}

export function useConversationAttachments(conversationId: string, enabled: boolean) {
    return useQuery({
        queryKey: ['attachments', conversationId],
        queryFn: async () => {
            const { data } = await api.get(`/messages/${conversationId}/attachments`)
            return data.attachments as Attachment[]
        },
        enabled,
    })
}