import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/hooks/useLogin'
import { supabase } from '@/lib/supabase'

interface LoginForm {
    email: string
    password: string
}

export default function LoginForm() {
    const navigate = useNavigate()
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
    const [errors, setErrors] = useState<Partial<LoginForm>>({})
    const login = useLogin()

    const validate = (): boolean => {
        const newErrors: Partial<LoginForm> = {}
        if (!form.email) newErrors.email = 'Email is required'
        if (!form.password) newErrors.password = 'Password is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        login.mutate({ email: form.email, password: form.password }, {
            onSuccess: async () => {
                // check profile directly from supabase after login
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const { data } = await supabase
                    .from('UserProfile')
                    .select('id')
                    .eq('userId', session.user.id)
                    .maybeSingle()

                if (!data) {
                    navigate({ to: '/onboarding' })
                } else {
                    navigate({ to: '/chat' })
                }
            },
        })
    }

    return (
        <Card className="w-full max-w-md border-0 shadow-none bg-gray-50 dark:bg-neutral-900">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    {login.isError && (
                        <p className="text-sm text-red-500 text-center">
                            {(login.error as Error)?.message || 'Invalid email or password'}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 mt-4">
                    <Button type="submit" className="w-full" disabled={login.isPending}>
                        {login.isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}