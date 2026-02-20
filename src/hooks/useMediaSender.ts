import { getApiError } from '@/lib/utils'
import { type UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SendPayload {
    content?: string
    files?: File[]
}

export function useMediaSender(sendMutation: UseMutationResult<unknown, unknown, SendPayload>) {
    const sendMedia = async (url: string) => {
        await sendMutation.mutateAsync({ content: url })
    }

    const sendVoice = async (file: File) => {
        try {
            await sendMutation.mutateAsync({ files: [file] })
        } catch (err: unknown) {
            toast.error(getApiError(err, 'Failed to send message.'))
        }
    }

    return { sendMedia, sendVoice }
}