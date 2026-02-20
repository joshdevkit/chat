import { createFileRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import api from '@/lib/axios'
import { ChatListPage } from '@/components/chat/ChatListPage'

export const Route = createFileRoute('/chat')({
    beforeLoad: async () => {
        try {
            await api.get('/auth/me')
        } catch {
            throw redirect({ to: '/login' })
        }
    },
    component: ChatLayout,
})

function ChatLayout() {
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const inConversation = pathname.startsWith('/chat/') && pathname.length > '/chat/'.length

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            <div className="flex flex-col w-full md:hidden">
                {inConversation ? (
                    <Outlet />
                ) : (
                    <ChatListPage />
                )}
            </div>

            {/* DESKTOP */}
            <div className="hidden md:flex w-full">
                {/* Sidebar */}
                <div className="w-100 border-r shrink-0 flex flex-col">
                    <ChatListPage />
                </div>
                {/* Content pane */}
                <div className="flex flex-1 flex-col min-w-0">
                    <Outlet />
                </div>
            </div>

        </div>
    )
}
