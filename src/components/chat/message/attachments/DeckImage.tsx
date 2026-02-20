import { useState, useRef } from 'react'
import type { Message } from '@/hooks/useMessages'
import { cn } from '@/lib/utils'
import { ImagePreviewModal } from './ImagePreviewModal'

export default function DeckImage({
    images,
    isMe,
    onDoubleClick,
}: {
    images: Message[]
    isMe: boolean
    onDoubleClick: () => void
}) {
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)
    const first = images[0]
    const extra = images.length - 1

    const handleClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
            onDoubleClick()
        } else {
            clickTimer.current = setTimeout(() => {
                clickTimer.current = null
                setPreviewIndex(0)
                setPreviewOpen(true)
            }, 300)
        }
    }

    const modalImages = images.map((m) => ({ src: m.fileUrl!, alt: m.fileName || 'image' }))

    return (
        <>
            <div
                className="relative cursor-pointer"
                style={{ width: 200, height: 220 }}
                onClick={handleClick}
            >
                {/* Layer 3 — furthest back */}
                <div
                    className="absolute rounded-2xl overflow-hidden bg-muted shadow-sm"
                    style={{ width: 200, height: 200, top: 16, left: isMe ? -8 : 8, opacity: 0.4 }}
                />
                {/* Layer 2 */}
                <div
                    className="absolute rounded-2xl overflow-hidden shadow-sm"
                    style={{ width: 200, height: 200, top: 8, left: isMe ? -4 : 4, opacity: 0.7 }}
                >
                    {images[1] && (
                        <img
                            src={images[1].fileUrl!}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    )}
                </div>

                {/* Front image */}
                <div
                    className="absolute rounded-2xl overflow-hidden shadow-md"
                    style={{ width: 200, height: 200, top: 0, left: 0 }}
                >
                    <img
                        src={first.fileUrl!}
                        alt={first.fileName || 'image'}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        +{extra} more
                    </div>
                </div>
            </div>

            <p className={cn(
                'text-xs text-muted-foreground px-1',
                isMe ? 'text-right' : 'text-left'
            )}>
                {isMe ? `You sent ${images.length} photos` : `${images.length} photos`}
            </p>

            {previewOpen && (
                <ImagePreviewModal
                    images={modalImages}
                    currentIndex={previewIndex}
                    onClose={() => setPreviewOpen(false)}
                    onPrev={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setPreviewIndex((i) => Math.min(modalImages.length - 1, i + 1))}
                />
            )}
        </>
    )
}