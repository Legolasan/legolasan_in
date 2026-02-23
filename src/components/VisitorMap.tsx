'use client'

import { memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import { cityCoordinates, countryCoordinates } from '@/lib/geoLookup'

interface VisitorLocation {
  country: string
  city: string | null
  count: number
}

interface VisitorMapProps {
  locations: VisitorLocation[]
}

// World map topojson URL (free, no API key needed)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function VisitorMap({ locations }: VisitorMapProps) {
  // Convert locations to markers with coordinates
  const markers = locations
    .map((loc) => {
      const coords = loc.city
        ? cityCoordinates[loc.city] || countryCoordinates[loc.country]
        : countryCoordinates[loc.country]

      if (!coords) return null

      return {
        name: loc.city || loc.country,
        coordinates: coords as [number, number],
        count: loc.count,
      }
    })
    .filter(Boolean) as Array<{
    name: string
    coordinates: [number, number]
    count: number
  }>

  // Calculate marker sizes based on visitor count
  const maxCount = Math.max(...markers.map((m) => m.count), 1)
  const getMarkerSize = (count: number) => {
    const minSize = 4
    const maxSize = 12
    return minSize + ((count / maxCount) * (maxSize - minSize))
  }

  return (
    <div className="w-full h-[400px] bg-gray-50 rounded-lg overflow-hidden">
      <ComposableMap
        projectionConfig={{
          scale: 147,
          center: [0, 20],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E5E7EB"
                stroke="#D1D5DB"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: '#D1D5DB' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map(({ name, coordinates, count }) => (
          <Marker key={`${name}-${coordinates[0]}-${coordinates[1]}`} coordinates={coordinates}>
            <circle
              r={getMarkerSize(count)}
              fill="#6366F1"
              fillOpacity={0.7}
              stroke="#4F46E5"
              strokeWidth={1}
            />
          </Marker>
        ))}
      </ComposableMap>
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No location data available yet
        </div>
      )}
    </div>
  )
}

export default memo(VisitorMap)
