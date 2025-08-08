"use client"

import { Star, MapPin, Wifi, Car, Coffee, Dumbbell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PropertyHeroProps {
    propertyName: string
    averageRating: number
    totalReviews: number
    location?: string
    images?: string[]
}

export function PropertyHero({
    propertyName,
    averageRating,
    totalReviews,
    location = "London, UK",
    images = []
}: PropertyHeroProps) {
    const displayImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ]

    const amenities = [
        { icon: Wifi, label: 'High-Speed WiFi' },
        { icon: Car, label: 'Parking Available' },
        { icon: Coffee, label: 'Kitchen Facilities' },
        { icon: Dumbbell, label: 'Fitness Center' }
    ]

    return (
        <div className="bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto px-6 py-12">
                {/* Hero Images */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 rounded-xl overflow-hidden">
                    <div className="lg:col-span-2">
                        <img
                            src={displayImages[0]}
                            alt={propertyName}
                            className="w-full h-96 lg:h-[500px] object-cover"
                        />
                    </div>
                    <div className="grid grid-rows-2 gap-4">
                        <img
                            src={displayImages[1]}
                            alt={`${propertyName} interior`}
                            className="w-full h-44 lg:h-60 object-cover rounded-lg"
                        />
                        <img
                            src={displayImages[2]}
                            alt={`${propertyName} amenities`}
                            className="w-full h-44 lg:h-60 object-cover rounded-lg"
                        />
                    </div>
                </div>

                {/* Property Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {propertyName}
                                </h1>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    <span className="text-lg">{location}</span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-6 w-6 ${star <= averageRating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-semibold text-gray-900">
                                            {averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span className="text-gray-600">
                                        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                        <amenity.icon className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Property Description */}
                        <div className="prose prose-gray max-w-none">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">About this property</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Experience modern living in the heart of London with this beautifully designed apartment.
                                Featuring contemporary furnishings, high-speed internet, and all the amenities you need for
                                a comfortable stay. Perfect for business travelers, couples, or anyone looking for a premium
                                accommodation experience in one of London&#39;s most vibrant neighborhoods.
                            </p>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6">
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    £89<span className="text-lg font-normal text-gray-600">/night</span>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    Free cancellation
                                </Badge>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Check-in
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Check-out
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Guests
                                    </label>
                                    <select className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent">
                                        <option>1 guest</option>
                                        <option>2 guests</option>
                                        <option>3 guests</option>
                                        <option>4 guests</option>
                                    </select>
                                </div>
                            </div>

                            <Button className="w-full text-white font-semibold py-3 text-lg">
                                Book Now
                            </Button>

                            <div className="text-center text-sm text-gray-500 mt-4">
                                You won&#39;t be charged yet
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
