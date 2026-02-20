import { useState, useRef } from 'react'
import { Paperclip, X, File, SendHorizonalIcon, Mic, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSendMessage } from '@/hooks/useMessages'
import { useFileAttachments } from '@/hooks/useFileAttachments'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { useMediaSender } from '@/hooks/useMediaSender'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { MediaPicker } from './input/MediaPicker'
import { VoiceRecorder } from './input/VoiceRecorder'
import { toast } from "sonner"
import { getApiError } from '@/lib/utils'

export function MessageInput({ conversationId }: { conversationId: string }) {
    const [text, setText] = useState('')
    const [mediaOpen, setMediaOpen] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMutation = useSendMessage(conversationId)
    const { files, fileRef, handleFileChange, removeFile, clearFiles } = useFileAttachments()
    const { sendTyping } = useTypingIndicator(conversationId)
    const { sendMedia, sendVoice } = useMediaSender(sendMutation)

    const { recording, sending, duration, start, stop, cancel } = useVoiceRecorder(sendVoice)

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
        sendTyping()
    }

    const handleSend = async () => {
        if (!text.trim() && files.length === 0) return
        try {
            await sendMutation.mutateAsync({
                content: text.trim() || undefined,
                files: files.map((f) => f.file),
            })
            setText('')
            clearFiles()
            setTimeout(() => inputRef.current?.focus(), 0)
        } catch (err: unknown) {
            toast.error(getApiError(err), {
                position: 'top-right',
                description: 'Failed to send message. Please try again.',
                dismissible: true,
            })
        }
    }

    const handleMediaSelect = async (url: string) => {
        setMediaOpen(false)
        try {
            await sendMedia(url)
        } catch (err: unknown) {
            console.log(err)
            toast.error(getApiError(err), {
                position: 'top-right',
                description: 'Failed to send media. Please try again.',
                dismissible: true,
            })
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const canSend = text.trim().length > 0 || files.length > 0

    return (
        <div className="border-t px-3 py-2 space-y-2 bg-inherit">
            {/* File previews */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map(({ file, preview }, index) => (
                        <div key={index} className="relative group/file">
                            {preview ? (
                                <img src={preview} className="w-16 h-16 rounded-lg object-cover border" />
                            ) : (
                                <div className="w-16 h-16 rounded-lg border bg-muted flex flex-col items-center justify-center gap-1 px-1">
                                    <File className="w-5 h-5 text-muted-foreground shrink-0" />
                                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                                        {file.name}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    ))}
                    {files.length > 1 && (
                        <div className="flex items-center text-xs text-muted-foreground self-end pb-1">
                            {files.length} files
                        </div>
                    )}
                </div>
            )}

            {/* Voice recording UI */}
            {recording || sending ? (
                <VoiceRecorder duration={duration} sending={sending} onStop={stop} onCancel={cancel} />
            ) : (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                        multiple
                        onChange={handleFileChange}
                    />

                    <Popover open={mediaOpen} onOpenChange={setMediaOpen}>
                        <PopoverTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                                <Smile className="w-5 h-5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="p-0 w-auto" align="start">
                            <MediaPicker onSelect={handleMediaSelect} />
                        </PopoverContent>
                    </Popover>

                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={text}
                        onChange={(e) => {
                            handleTextChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)
                            e.target.style.height = 'auto'
                            e.target.style.height = `${e.target.scrollHeight}px`
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        disabled={sendMutation.isPending}
                        className="flex-1 rounded-2xl border border-input bg-background 
                        px-3 py-2 text-sm resize-none overflow-hidden min-h-9 max-h-30 
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                    />

                    {canSend ? (
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={sendMutation.isPending}
                            className="rounded-full shrink-0"
                        >
                            {sendMutation.isPending
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <SendHorizonalIcon className="w-4 h-4" />
                            }
                        </Button>
                    ) : (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={start}
                            className="rounded-full shrink-0"
                        >
                            <Mic className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}