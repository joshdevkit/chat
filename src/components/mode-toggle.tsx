import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-muted transition-colors"
        >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 absolute" />
            <Moon className="h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}