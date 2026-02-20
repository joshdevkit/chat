import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    images: { src: string; alt?: string }[]
    currentIndex: number
    onClose: () => void
    onPrev: () => void
    onNext: () => void
}

export function ImagePreviewModal({ images, currentIndex, onClose, onPrev, onNext }: Props) {
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < images.length - 1
    const current = images[currentIndex]

    // keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft' && hasPrev) onPrev()
            if (e.key === 'ArrowRight' && hasNext) onNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [hasPrev, hasNext, onClose, onPrev, onNext])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Prev button */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev() }}
                    className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Image */}
            <img
                src={current.src}
                alt={current.alt || 'image'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
            />

            {/* Next button */}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext() }}
                    className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); Array.from({ length: Math.abs(i - currentIndex) }).forEach(() => i > currentIndex ? onNext() : onPrev()) }}
                            className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all',
                                i === currentIndex ? 'bg-white w-3' : 'bg-white/40'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}