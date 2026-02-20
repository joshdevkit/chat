import { useState, useRef } from 'react'
import type { Message } from '@/hooks/useMessages'
import { ImagePreviewModal } from './ImagePreviewModal'

export default function StackedImage({
    msg,
    offset,
    total,
    isMe,
    onDoubleClick,
    allImages, // all images in the group for prev/next
    imageIndex, // index of this image in allImages
}: {
    msg: Message
    offset: number
    total: number
    isMe: boolean
    onDoubleClick: () => void
    allImages: Message[]
    imageIndex: number
}) {
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(imageIndex)

    const handleClick = () => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current)
            clickTimer.current = null
            onDoubleClick()
        } else {
            clickTimer.current = setTimeout(() => {
                clickTimer.current = null
                setPreviewIndex(imageIndex)
                setPreviewOpen(true)
            }, 300)
        }
    }

    // deck-style stacking: each image offset to look like a pile
    const offsetPx = (total - 1 - offset) * 10
    const style = isMe
        ? { marginRight: offsetPx }
        : { marginLeft: offsetPx }

    const modalImages = allImages.map((m) => ({ src: m.fileUrl!, alt: m.fileName || 'image' }))

    return (
        <>
            <div
                style={{ ...style, width: 200 }}
                className="rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                onClick={handleClick}
            >
                <img
                    src={msg.fileUrl!}
                    alt={msg.fileName || 'image'}
                    className="w-full h-44 object-cover"
                    draggable={false}
                />
            </div>

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