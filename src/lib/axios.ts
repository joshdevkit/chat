import axios from 'axios'
import { router } from '@/main'

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const pathname = window.location.pathname
            if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
                router.navigate({ to: '/login' })
            }
        }
        return Promise.reject(error)
    }
)

export default api