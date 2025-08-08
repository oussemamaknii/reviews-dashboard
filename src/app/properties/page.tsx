"use client"

import { useState, useEffect, useMemo } from 'react'
import propertiesData from '@/data/properties.json'
import Link from 'next/link'
import dynamic from 'next/dynamic'
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
    latitude?: number
    longitude?: number
}

export default function PropertiesPage() {
    const PropertiesMap = dynamic(() => import('@/components/properties/PropertiesMap').then(m => m.PropertiesMap), { ssr: false })
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const mapped: Property[] = (propertiesData as Array<{ name: string; location: string; imageUrl: string; pricePerNight: number; maxGuests: number; latitude?: number; longitude?: number }>).map((p) => ({
            name: p.name,
            location: p.location,
            averageRating: 0,
            totalReviews: 0,
            imageUrl: p.imageUrl,
            pricePerNight: p.pricePerNight,
            maxGuests: p.maxGuests,
            latitude: p.latitude,
            longitude: p.longitude,
        }))
        setProperties(mapped)
        setLoading(false)

        // Fetch live review stats per property and merge
        ;(async () => {
            try {
                type StatsResponse = { success: boolean; data: { statistics: { average_rating: number; total_reviews: number } } }
                const updates = await Promise.all(mapped.map(async (p) => {
                    try {
                        const res = await fetch(`/api/reviews/public/${encodeURIComponent(p.name)}`)
                        const json = await res.json() as StatsResponse
                        if (json.success) {
                            return { name: p.name, avg: json.data.statistics.average_rating, total: json.data.statistics.total_reviews }
                        }
                    } catch {}
                    return { name: p.name, avg: 0, total: 0 }
                }))
                setProperties(prev => prev.map(prop => {
                    const u = updates.find(x => x.name === prop.name)
                    return u ? { ...prop, averageRating: u.avg, totalReviews: u.total } : prop
                }))
            } catch {}
        })()
    }, [])

    const [page, setPage] = useState(1)
    const pageSize = 12
    const totalPages = Math.max(1, Math.ceil(properties.length / pageSize))
    const paged = useMemo(() => properties.slice((page - 1) * pageSize, page * pageSize), [properties, page])

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
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center brand-gradient">
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
                        Discover premium accommodation options across London&#39;s most desirable locations
                    </p>
                </div>

                {/* Main Layout: Content + Map */}
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left Content */}
                    <div className="flex-1 xl:max-w-4xl">
                        {/* Properties Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paged.map((property, index) => (
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

                        {/* Pagination controls */}
                        <div className="flex items-center justify-between mt-8">
                            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                            </div>
                        </div>

                        {/* Call to Action - Mobile/Desktop bottom */}
                        <div className="mt-12 xl:hidden">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Can&#39;t find what you&#39;re looking for?
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Our team is here to help you find the perfect accommodation for your needs.
                                </p>
                                <Button size="lg">
                                    Contact Our Team
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Map */}
                    <div className="xl:w-[560px] xl:sticky xl:top-24 xl:self-start">
                        <div className="space-y-6">
                            <PropertiesMap properties={properties} />

                            {/* Call to Action - Desktop right sidebar */}
                            <div className="hidden xl:block">
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                                        Can&#39;t find what you&#39;re looking for?
                                    </h2>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Our team is here to help you find the perfect accommodation for your needs.
                                    </p>
                                    <Button size="sm" className="w-full">
                                        Contact Our Team
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center brand-gradient">
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
