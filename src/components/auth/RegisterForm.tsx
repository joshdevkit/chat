import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegister } from '@/hooks/useRegister'

export default function RegisterForm() {
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const register = useRegister()

    const validate = () => {
        const e: Record<string, string> = {}
        if (!fullName.trim()) e.fullName = 'Full name is required'
        if (!email.trim()) e.email = 'Email is required'
        else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Invalid email'
        if (!password) e.password = 'Password is required'
        else if (password.length < 8) e.password = 'At least 8 characters'
        if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
        else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
        return e
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setErrors({})

        register.mutate({ fullName, email, password }, {
            onSuccess: () => navigate({ to: '/onboarding' }),
        })
    }

    return (
        <Card className="w-full max-w-md border-0 shadow-none bg-gray-50 dark:bg-neutral-900">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {register.isError && (
                        <p className="text-sm text-red-500 text-center">
                            {(register.error as Error)?.message || 'Something went wrong'}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 mt-4">
                    <Button type="submit" className="w-full" disabled={register.isPending}>
                        {register.isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/auth" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}