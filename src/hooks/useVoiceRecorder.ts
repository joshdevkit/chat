import { useState, useRef } from 'react'

export function useVoiceRecorder(onRecorded: (file: File) => void) {
    const [recording, setRecording] = useState(false)
    const [sending, setSending] = useState(false)
    const [duration, setDuration] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            chunksRef.current = []

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const voiceFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
                onRecorded(voiceFile)
                stream.getTracks().forEach((t) => t.stop())
                setSending(false)
            }

            recorder.start()
            mediaRecorderRef.current = recorder
            setRecording(true)
            setSending(false)
            setDuration(0)
            timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
        } catch {
            alert('Microphone access denied')
        }
    }

    const stop = () => {
        mediaRecorderRef.current?.stop()
        setRecording(false)
        setSending(true)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const cancel = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.ondataavailable = null
            mediaRecorderRef.current.onstop = null
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
        }
        setRecording(false)
        setSending(false)
        setDuration(0)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    return { recording, sending, duration, start, stop, cancel }
}

export function formatDuration(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
}