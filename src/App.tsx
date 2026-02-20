import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'

export const router = createRouter({
    routeTree,
    context: { queryClient },
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Toaster />
                <RouterProvider router={router} />
            </ThemeProvider>
        </QueryClientProvider>
    )
}