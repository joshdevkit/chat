import { createFileRoute, redirect } from '@tanstack/react-router'
import api from '@/lib/axios'

interface MeResponse {
    user: {
        id: string
        profile: { username: string } | null
    }
}

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        try {
            const { data } = await api.get<MeResponse>('/auth/me')
            const user = data.user
            if (!user.profile) {
                throw redirect({ to: '/onboarding' })
            }
            throw redirect({ to: '/chat' })
        } catch (err: unknown) {
            if (
                err !== null &&
                typeof err === 'object' &&
                'isRedirect' in err
            ) {
                throw err
            }
            throw redirect({ to: '/login' })
        }
    },
    component: () => null,
})