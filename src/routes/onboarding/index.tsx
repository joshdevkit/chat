import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/PageHead'
import OnboardingForm from '@/components/auth/OnboardingForm'

export const Route = createFileRoute('/onboarding/')({
    component: OnboardingPage,
})

function OnboardingPage() {
    return (
        <>
            <Header title="Complete Profile" description="Set up your profile to get started" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 py-10">
                <OnboardingForm />
            </div>
        </>
    )
}