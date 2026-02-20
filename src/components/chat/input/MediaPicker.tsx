import { useState } from 'react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import type { IGif } from '@giphy/js-types'

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY)

interface Props {
    onSelect: (url: string) => void
}

export function MediaPicker({ onSelect }: Props) {
    const [query, setQuery] = useState('')
    const [tab, setTab] = useState<'gifs' | 'stickers'>('gifs')

    const handleSelect = (gif: IGif) => {
        onSelect(gif.images.original.url)
    }

    const fetchGifs = (offset: number) =>
        query.trim()
            ? gf.search(query, { offset, limit: 20, type: 'gifs' })
            : gf.trending({ offset, limit: 20, type: 'gifs' })

    const fetchStickers = (offset: number) =>
        query.trim()
            ? gf.search(query, { offset, limit: 20, type: 'stickers' })
            : gf.trending({ offset, limit: 20, type: 'stickers' })

    return (
        <div className="w-72 p-2 space-y-2">
            <Input
                placeholder="Search GIFs & Stickers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 text-sm"
                autoFocus
            />
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'gifs' | 'stickers')}>
                <TabsList className="w-full">
                    <TabsTrigger value="gifs" className="flex-1 text-xs">GIFs</TabsTrigger>
                    <TabsTrigger value="stickers" className="flex-1 text-xs">Stickers</TabsTrigger>
                </TabsList>

                <TabsContent value="gifs">
                    <div className="max-h-60 overflow-y-auto">
                        <Grid
                            key={`gifs-${query}`}
                            onGifClick={(gif, e) => { e.preventDefault(); handleSelect(gif) }}
                            fetchGifs={fetchGifs}
                            width={256}
                            columns={3}
                            gutter={4}
                            noLink
                        />
                    </div>
                </TabsContent>

                <TabsContent value="stickers">
                    <div className="max-h-60 overflow-y-auto">
                        <Grid
                            key={`stickers-${query}`}
                            onGifClick={(gif, e) => { e.preventDefault(); handleSelect(gif) }}
                            fetchGifs={fetchStickers}
                            width={256}
                            columns={3}
                            gutter={4}
                            noLink
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}