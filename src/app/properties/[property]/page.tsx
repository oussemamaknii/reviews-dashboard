"use client"

import { useEffect, useState } from 'react'
import { PropertyHero } from '@/components/public/PropertyHero'
import { ReviewsSection } from '@/components/public/ReviewsSection'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PropertyPageProps {
    params: Promise<{
        property: string
    }>
}

interface PropertyData {
    reviews: any[]
    statistics: {
        total_reviews: number
        average_rating: number
        category_averages: Record<string, number>
        rating_distribution: any[]
    }
    property_name: string
}

export default function PropertyPage({ params }: PropertyPageProps) {
    const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
    const [loading, setLoading] = useState(true)
    const [propertyName, setPropertyName] = useState<string>('')

    useEffect(() => {
        const getParams = async () => {
            const { property } = await params
            setPropertyName(decodeURIComponent(property))
        }
        getParams()
    }, [params])

    useEffect(() => {
        if (propertyName) {
            fetchPropertyData()
        }
    }, [propertyName])

    const fetchPropertyData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/reviews/public/${encodeURIComponent(propertyName)}`)
            const data = await response.json()

            if (data.success) {
                setPropertyData(data.data)
            }
        } catch (error) {
            console.error('Error fetching property data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-6 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="h-96 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!propertyData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
                    <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
                    <Link href="/properties">
                        <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Properties
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Properties</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Flex Living</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">FL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Property Hero Section */}
            <PropertyHero
                propertyName={propertyData.property_name}
                averageRating={propertyData.statistics.average_rating}
                totalReviews={propertyData.statistics.total_reviews}
            />

            {/* Reviews Section */}
            <ReviewsSection propertyName={propertyName} />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">FL</span>
                                </div>
                                <span className="text-xl font-bold">Flex Living</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Premium accommodation solutions for modern travelers and professionals.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Properties</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">London</a></li>
                                <li><a href="#" className="hover:text-white">Manchester</a></li>
                                <li><a href="#" className="hover:text-white">Birmingham</a></li>
                                <li><a href="#" className="hover:text-white">Edinburgh</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white">Booking Policy</a></li>
                                <li><a href="#" className="hover:text-white">Cancellation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Press</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2024 Flex Living. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
