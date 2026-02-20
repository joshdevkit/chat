import { useEffect } from 'react'

interface Props {
    title: string
    description?: string
}

export function Header({ title, description }: Props) {
    useEffect(() => {
        document.title = `${title} | E-Yak Chat App`

        if (description) {
            let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
            if (!meta) {
                meta = document.createElement('meta')
                meta.name = 'description'
                document.head.appendChild(meta)
            }
            meta.content = description
        }

        return () => {
            document.title = 'E-Yak Chat App'
        }
    }, [title, description])

    return null
}