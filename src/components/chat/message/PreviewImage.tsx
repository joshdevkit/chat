import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    src: string
    alt?: string
    className?: string
}

export function PreviewImage({ src, alt = 'Image', className }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                className="relative group/img cursor-zoom-in"
                onClick={() => setOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className={cn('rounded-lg object-cover', className ?? 'max-w-xs max-h-64')}
                />
                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    )
}