import { File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Message } from '@/hooks/useMessages'
import { PreviewImage } from './PreviewImage'

interface Props {
    message: Message
    isMe: boolean
}

export function MessageContent({ message, isMe }: Props) {
    const isGiphyUrl = message.content?.includes('giphy.com')

    return (
        <>
            {message.type === 'IMAGE' && message.fileUrl && (
                <PreviewImage src={message.fileUrl} alt="Image" />
            )}

            {message.type === 'FILE' && message.fileUrl && (
                <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'flex items-center gap-2 underline',
                        isMe ? 'text-primary-foreground' : 'text-foreground'
                    )}
                >
                    <File className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-45">
                        {message.fileName || 'File'}
                    </span>
                </a>
            )}

            {message.content && isGiphyUrl && (
                <img
                    src={message.content}
                    alt="GIF"
                    className="rounded-xl max-w-50 max-h-50 object-contain"
                    loading="lazy"
                />
            )}

            {message.content && !isGiphyUrl && (
                <p>{message.content}</p>
            )}
        </>
    )
}