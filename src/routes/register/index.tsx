import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/PageHead'
import RegisterForm from '@/components/auth/RegisterForm'

export const Route = createFileRoute('/register/')({
    component: RegisterPage,
})

function RegisterPage() {
    return (
        <>
            <Header title="Register" description="Create a new ChatApp account" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
                <RegisterForm />
            </div>
        </>
    )
}