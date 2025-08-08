"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Users, ArrowLeft } from 'lucide-react'

interface Property {
    name: string
    location: string
    averageRating: number
    totalReviews: number
    imageUrl: string
    pricePerNight: number
    maxGuests: number
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real app, this would fetch from an API
        // For demo, we'll use the property names from our mock data
        const mockProperties: Property[] = [
            {
                name: "2B N1 A - 29 Shoreditch Heights",
                location: "Shoreditch, London",
                averageRating: 8.5,
                totalReviews: 2,
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                pricePerNight: 89,
                maxGuests: 4
            },
            {
                name: "1B E1 B - 15 Canary Wharf Tower",
                location: "Canary Wharf, London",
                averageRating: 8.7,
                totalReviews: 1,
                imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
                pricePerNight: 95,
                maxGuests: 2
            },
            {
                name: "Studio W2 C - 42 Paddington Central",
                location: "Paddington, London",
                averageRating: 6.5,
                totalReviews: 1,
                imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                pricePerNight: 75,
                maxGuests: 2
            },
            {
                name: "2B SW1 D - 88 Victoria Gardens",
                location: "Victoria, London",
                averageRating: 9.8,
                totalReviews: 1,
                imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                pricePerNight: 105,
                maxGuests: 4
            }
        ]

        setTimeout(() => {
            setProperties(mockProperties)
            setLoading(false)
        }, 1000)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-6 py-12">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Dashboard</span>
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

            <div className="container mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Properties</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover premium accommodation options across London's most desirable locations
                    </p>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property, index) => (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="relative">
                                <img
                                    src={property.imageUrl}
                                    alt={property.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white text-gray-900 shadow-md">
                                        £{property.pricePerNight}/night
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader>
                                <CardTitle className="text-lg line-clamp-2">
                                    {property.name.split(' - ')[0]}
                                </CardTitle>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {property.location}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{property.averageRating}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            ({property.totalReviews} {property.totalReviews === 1 ? 'review' : 'reviews'})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Users className="h-4 w-4" />
                                        <span>{property.maxGuests} guests</span>
                                    </div>
                                </div>

                                <Link href={`/properties/${encodeURIComponent(property.name)}`}>
                                    <Button className="w-full">
                                        View Property & Reviews
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Our team is here to help you find the perfect accommodation for your needs.
                        </p>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                            Contact Our Team
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-16">
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
