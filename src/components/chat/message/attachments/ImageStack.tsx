import type { Message } from '@/hooks/useMessages'
import StackedImage from './StackedImage'
import { cn } from '@/lib/utils'
import { File } from 'lucide-react'
import DeckImage from './DeckImage'

export default function ImageStack({
    messages,
    isMe,
    onDoubleClick,
}: {
    messages: Message[]
    isMe: boolean
    onDoubleClick: () => void
}) {
    const images = messages.filter((m) => m.type === 'IMAGE')
    const files = messages.filter((m) => m.type === 'FILE')
    const textMsg = messages.find((m) => m.type === 'TEXT')
    const count = images.length

    return (
        <div className={cn('flex flex-col gap-1', isMe && 'items-end')}>
            {images.length > 0 && (
                <>
                    {count <= 3 ? (
                        <div className="flex flex-col gap-1">
                            {images.map((msg, i) => (
                                <StackedImage
                                    key={msg.id}
                                    msg={msg}
                                    offset={i}
                                    total={count}
                                    isMe={isMe}
                                    onDoubleClick={onDoubleClick}
                                    allImages={images}
                                    imageIndex={i}
                                />
                            ))}
                        </div>
                    ) : (
                        <DeckImage
                            images={images}
                            isMe={isMe}
                            onDoubleClick={onDoubleClick}
                        />
                    )}
                </>
            )}

            {files.map((msg) => (
                <a
                    key={msg.id}
                    href={msg.fileUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border bg-muted hover:bg-muted/80 transition-colors',
                        isMe && 'bg-primary/10 border-primary/20'
                    )}
                >
                    <File className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-40">{msg.fileName}</span>
                </a>
            ))
            }

            {
                textMsg && (
                    <div className={cn(
                        'px-3 py-2 rounded-2xl text-sm',
                        isMe
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                    )}>
                        {textMsg.content}
                    </div>
                )
            }
        </div >
    )
}