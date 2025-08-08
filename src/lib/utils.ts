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
        'hostaway': 'bg-white text-primary border border-primary/20',
        'google': 'bg-white text-green-700 border border-green-200',
        'airbnb': 'bg-white text-red-700 border border-red-200',
        'booking': 'bg-white text-yellow-700 border border-yellow-200',
        'default': 'bg-white text-gray-800 border border-gray-200'
    }
    return colors[channel.toLowerCase()] || colors.default
}

export function calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}
