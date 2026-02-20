import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { routeTree } from './routeTree.gen'
import './index.css'
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

// store the root globally to prevent multiple createRoot calls during HMR
let root: Root | null = (window as any).__reactRoot

if (!root) {
  root = createRoot(document.getElementById('root')!)
    ; (window as any).__reactRoot = root
}

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <Toaster />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
