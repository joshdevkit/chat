import { useState } from 'react'
import { MoreVertical, Image, FileText, Download } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useConversationAttachments } from '@/hooks/useConversationAttachments'
import type { Attachment } from '@/hooks/useConversationAttachments'

interface Props {
    conversationId: string
}

function ImageGrid({ items }: { items: Attachment[] }) {
    if (!items.length) return (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No images yet
        </div>
    )
    return (
        <div className="grid grid-cols-3 gap-1">
            {items.map((a) => (
                <a key={a.id} href={a.fileUrl!} target="_blank" rel="noopener noreferrer">
                    <img
                        src={a.fileUrl!}
                        alt={a.fileName || 'Image'}
                        className="w-full aspect-square object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                </a>
            ))}
        </div>
    )
}

function FileList({ items }: { items: Attachment[] }) {
    if (!items.length) return (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No files yet
        </div>
    )
    return (
        <div className="space-y-2">
            {items.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.fileName || 'File'}</p>
                        <p className="text-xs text-muted-foreground">
                            {a.sender.fullName} · {format(new Date(a.createdAt), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <a href={a.fileUrl!} target="_blank" rel="noopener noreferrer" download>
                        <Button size="icon" variant="ghost" className="w-8 h-8 shrink-0">
                            <Download className="w-4 h-4" />
                        </Button>
                    </a>
                </div>
            ))}
        </div>
    )
}

export function ConversationAttachmentsSheet({ conversationId }: Props) {
    const [open, setOpen] = useState(false)
    const { data: attachments = [], isLoading } = useConversationAttachments(conversationId, open)

    const images = attachments.filter((a) => a.type === 'IMAGE')
    const files = attachments.filter((a) => a.type === 'FILE')

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-100 p-0 flex flex-col">
                <SheetHeader className="px-4 py-4 border-b">
                    <SheetTitle>Attachments</SheetTitle>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : (
                    <Tabs defaultValue="images" className="flex flex-col flex-1 min-h-0">
                        <TabsList className="mx-4 mt-3 shrink-0">
                            <TabsTrigger value="images" className="flex-1 gap-1.5">
                                <Image className="w-3.5 h-3.5" />
                                Images
                                {images.length > 0 && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">
                                        {images.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="files" className="flex-1 gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Files
                                {files.length > 0 && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">
                                        {files.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="images" className="flex-1 overflow-y-auto px-4 py-3 mt-0">
                            <ImageGrid items={images} />
                        </TabsContent>

                        <TabsContent value="files" className="flex-1 overflow-y-auto px-4 py-3 mt-0">
                            <FileList items={files} />
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    )
}