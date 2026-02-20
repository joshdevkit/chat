import { useState, useRef } from 'react'

export interface FilePreview {
    file: File
    preview: string | null
}

export function useFileAttachments() {
    const [files, setFiles] = useState<FilePreview[]>([])
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || [])
        if (!selected.length) return
        const newFiles: FilePreview[] = selected.map((f) => ({
            file: f,
            preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
        }))
        setFiles((prev) => [...prev, ...newFiles])
        if (fileRef.current) fileRef.current.value = ''
    }

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const updated = [...prev]
            if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!)
            updated.splice(index, 1)
            return updated
        })
    }

    const clearFiles = () => {
        files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview) })
        setFiles([])
        if (fileRef.current) fileRef.current.value = ''
    }

    return { files, fileRef, handleFileChange, removeFile, clearFiles }
}