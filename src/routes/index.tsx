import { supabase } from '@/lib/supabase'
import { createFileRoute, redirect } from '@tanstack/react-router'


export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const user = session?.user
            if (!user) {
                throw redirect({ to: '/auth' })
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
            throw redirect({ to: '/auth' })
        }
    },
    component: () => null,
})