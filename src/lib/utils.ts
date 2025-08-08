import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatRating(rating: number): string {
    return rating.toFixed(1)
}

export function getReviewChannelColor(channel: string): string {
    const colors: Record<string, string> = {
        'hostaway': 'bg-primary/10 text-primary',
        'google': 'bg-green-100 text-green-800',
        'airbnb': 'bg-red-100 text-red-800',
        'booking': 'bg-yellow-100 text-yellow-800',
        'default': 'bg-gray-100 text-gray-800'
    }
    return colors[channel.toLowerCase()] || colors.default
}

export function calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}
