import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getApiError(err: unknown, fallback = 'Something went wrong.'): string {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback
}