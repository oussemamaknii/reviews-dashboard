"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

// Default Leaflet marker icons fix for bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

// Fix for marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

L.Marker.prototype.options.icon = DefaultIcon

interface PropertyItem {
  name: string
  location: string
  latitude?: number
  longitude?: number
  pricePerNight: number
}

export function PropertiesMap({ properties }: { properties: PropertyItem[] }) {
  const center: [number, number] = [51.5074, -0.1278]
  const markers = properties.filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number')

  function ResizeHandler() {
    const map = useMap()
    useEffect(() => {
      const invalidate = () => map.invalidateSize({ animate: false })
      // On mount and shortly after to catch layout/Fonts
      invalidate()
      const t = setTimeout(invalidate, 150)
      // On tile load
      map.on('load', invalidate)
      // On window resize
      window.addEventListener('resize', invalidate)
      return () => {
        clearTimeout(t)
        map.off('load', invalidate)
        window.removeEventListener('resize', invalidate)
      }
    }, [map])
    return null
  }

  curl - sS "https://api.yelp.com/v3/businesses/aXhULppx31yHNxz5PGQ0IQ/reviews?limit=20&sort_by=yelp_sort" \
  -H "authorization: Bearer rSmQ6gXd-wXYlwp-rsfJdGNS7qLdA9VQQqrooYqx3akXQHjAov7uFM9gfKDspAnkIZi_Tnu7HfkPQBK8RnNBiom3MR9by2ziok8fgKgm6PEfpitVQgA-DINq-ciUaHYx" - H "accept: application/json"

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Property Locations</h3>
        <p className="text-sm text-gray-600">{markers.length} properties found</p>
      </div>
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border">
        <MapContainer
          center={center}
          zoom={11}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <ResizeHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {markers.map((p, idx) => (
            <Marker key={`${p.name}-${idx}`} position={[p.latitude as number, p.longitude as number]}>
              <Popup maxWidth={250}>
                <div className="p-2">
                  <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{p.location}</div>
                  <div className="text-sm font-medium text-primary">£{p.pricePerNight}/night</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
