import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCreateGroup } from '@/hooks/useConversations'
import { supabase } from '@/lib/supabase'

export function NewGroupDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any[]>([])
  const createGroup = useCreateGroup()
  const navigate = useNavigate()

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const { data, error } = await supabase
      .from('User')
      .select('id, fullName, profile ( avatarUrl )')
      .ilike('fullName', `%${q}%`)
    if (error) throw error
    setResults(data.filter((u: any) => !selected.find((s) => s.id === u.id)))
  }

  const handleCreate = async () => {
    if (!name || selected.length === 0) return
    const conv = await createGroup.mutateAsync({
      name,
      memberIds: selected.map((s) => s.id),
    })
    setOpen(false)
    navigate({ to: '/chat/$conversationId', params: { conversationId: conv.id } })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="py-2 px-2"><Users className="w-5 h-5" /></button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-md">
        <DialogHeader>
          <DialogTitle>New Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <Input placeholder="Group name..." value={name} onChange={(e) => setName(e.target.value)} />

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span
                  key={u.id}
                  onClick={() => setSelected(selected.filter((s) => s.id !== u.id))}
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full cursor-pointer"
                >
                  {u.fullName} ×
                </span>
              ))}
            </div>
          )}

          <Input placeholder="Add members..." value={query} onChange={(e) => handleSearch(e.target.value)} />

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => { setSelected([...selected, user]); setResults([]); setQuery('') }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profile?.avatarUrl || ''} />
                  <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-sm">{user.fullName}</p>
              </button>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!name || selected.length === 0 || createGroup.isPending}
          >
            {createGroup.isPending ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
