import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

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
            const { data, error } = await supabase
                .from('Message')
                .select(`
          id,
          fileUrl,
          fileName,
          type,
          createdAt,
          sender:User!Message_senderId_fkey (
            id,
            fullName
          )
        `)
                .eq('conversationId', conversationId)
                .in('type', ['IMAGE', 'FILE'])
                .is('deletedAt', null)
                .order('createdAt', { ascending: false })

            if (error) throw error

            return (data ?? []).map((attachment: any) => ({
                ...attachment,
                sender: Array.isArray(attachment.sender)
                    ? attachment.sender[0]
                    : attachment.sender,
            })) as Attachment[]
        },
        enabled,
    })
}