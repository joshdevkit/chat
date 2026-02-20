import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/PageHead'
import LoginForm from '@/components/auth/LoginForm'

export const Route = createFileRoute('/auth/')({
    component: LoginPage,
})

function LoginPage() {
    return (
        <>
            <Header title="Authentication" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
                <LoginForm />
            </div>
        </>
    )
}