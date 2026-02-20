import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteConversation } from '@/hooks/useDeleteConversation'
import { useNavigate, useMatchRoute } from '@tanstack/react-router'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
    conversationId: string
}

export function ConversationActions({ conversationId }: Props) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const deleteMutation = useDeleteConversation()
    const navigate = useNavigate()
    const matchRoute = useMatchRoute()

    const isActive = !!matchRoute({
        to: '/chat/$conversationId',
        params: { conversationId },
    })

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        if (menuOpen) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [menuOpen])

    const handleDelete = async () => {
        await deleteMutation.mutateAsync(conversationId)
        setDialogOpen(false)
        if (isActive) navigate({ to: '/chat' })
    }

    return (
        <>
            <div
                ref={ref}
                className="relative shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setMenuOpen((p) => !p)}
                    className={cn(
                        '',
                        'p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-30 bg-background border rounded-xl shadow-lg py-1 min-w-40">
                        <button
                            onClick={() => {
                                setMenuOpen(false)
                                setDialogOpen(true)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            Delete conversation
                        </button>
                    </div>
                )}
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 dark:text-black text-white"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}