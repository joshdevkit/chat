import { Palette } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useUpdateConversationTheme } from '@/hooks/useConversationTheme'
import { cn } from '@/lib/utils'

const BG_COLORS = [
    { label: 'Default', value: null, preview: 'bg-background' },
    { label: 'Rose', value: 'hsl(355.7 100% 97.3%)', darkValue: 'hsl(355.7 40% 10%)', preview: 'bg-rose-50 dark:bg-rose-950' },
    { label: 'Orange', value: 'hsl(33.3 100% 96.5%)', darkValue: 'hsl(33.3 40% 10%)', preview: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Sky', value: 'hsl(204 100% 97.1%)', darkValue: 'hsl(204 40% 10%)', preview: 'bg-sky-50 dark:bg-sky-950' },
    { label: 'Violet', value: 'hsl(270 100% 98%)', darkValue: 'hsl(270 40% 10%)', preview: 'bg-violet-50 dark:bg-violet-950' },
    { label: 'Green', value: 'hsl(138.5 76.5% 96.7%)', darkValue: 'hsl(138.5 30% 10%)', preview: 'bg-green-50 dark:bg-green-950' },
    { label: 'Yellow', value: 'hsl(54.5 91.7% 95.3%)', darkValue: 'hsl(54.5 40% 10%)', preview: 'bg-yellow-50 dark:bg-yellow-950' },
    { label: 'Zinc', value: 'hsl(240 4.8% 95.9%)', darkValue: 'hsl(240 5.9% 10%)', preview: 'bg-zinc-100 dark:bg-zinc-900' },
]

const TEXT_COLORS = [
    { label: 'Default', value: null, preview: 'bg-foreground' },
    { label: 'Rose', value: 'hsl(346.8 77.2% 49.8%)', preview: 'bg-rose-500' },
    { label: 'Violet', value: 'hsl(263.4 70% 50.4%)', preview: 'bg-violet-600' },
    { label: 'Sky', value: 'hsl(199 89.1% 48.4%)', preview: 'bg-sky-500' },
    { label: 'Emerald', value: 'hsl(160 84.1% 39.4%)', preview: 'bg-emerald-500' },
    { label: 'Amber', value: 'hsl(37.7 92.1% 50.2%)', preview: 'bg-amber-500' },
    { label: 'Muted', value: 'hsl(240 3.8% 46.1%)', preview: 'bg-muted-foreground' },
]

interface Props {
    conversationId: string
    currentBg: string | null
    currentText: string | null
}

// detect dark mode
function isDark() {
    return document.documentElement.classList.contains('dark')
}

export function ThemePicker({ conversationId, currentBg, currentText }: Props) {
    const updateTheme = useUpdateConversationTheme(conversationId)

    const handleBgSelect = (color: typeof BG_COLORS[0]) => {
        if (color.value === null) {
            updateTheme.mutate({ bgColor: null })
            return
        }
        // use dark variant if in dark mode
        const value = isDark() && color.darkValue ? color.darkValue : color.value
        updateTheme.mutate({ bgColor: value })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Palette className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-4 p-4">
                <p className="text-sm font-semibold">Chat theme</p>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Background</p>
                    <div className="flex flex-wrap gap-2">
                        {BG_COLORS.map((c) => (
                            <button
                                key={c.label}
                                onClick={() => handleBgSelect(c)}
                                title={c.label}
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                                    c.preview,
                                    // selected ring
                                    currentBg === c.value || (c.value === null && currentBg === null)
                                        ? 'border-violet-500'
                                        : 'border-border'
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Text color</p>
                    <div className="flex flex-wrap gap-2">
                        {TEXT_COLORS.map((c) => (
                            <button
                                key={c.label}
                                onClick={() => updateTheme.mutate({ textColor: c.value })}
                                title={c.label}
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                                    c.preview,
                                    currentText === c.value || (c.value === null && currentText === null)
                                        ? 'border-violet-500'
                                        : 'border-border'
                                )}
                            />
                        ))}
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => updateTheme.mutate({ bgColor: null, textColor: null })}
                >
                    Reset to default
                </Button>
            </PopoverContent>
        </Popover>
    )
}