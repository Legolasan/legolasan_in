/**
 * Geo-lookup utility using ip-api.com (free, 45 req/min)
 * Returns country and city for a given IP address
 */

interface GeoData {
  country: string | null
  city: string | null
}

// Simple in-memory cache to avoid repeated lookups
const geoCache = new Map<string, { data: GeoData; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// City to approximate coordinates mapping for map rendering
export const cityCoordinates: Record<string, [number, number]> = {
  // Major cities - will be expanded as needed
  'New York': [-74.006, 40.7128],
  'Los Angeles': [-118.2437, 34.0522],
  'Chicago': [-87.6298, 41.8781],
  'San Francisco': [-122.4194, 37.7749],
  'Seattle': [-122.3321, 47.6062],
  'London': [-0.1276, 51.5074],
  'Paris': [2.3522, 48.8566],
  'Berlin': [13.405, 52.52],
  'Tokyo': [139.6917, 35.6895],
  'Singapore': [103.8198, 1.3521],
  'Sydney': [151.2093, -33.8688],
  'Mumbai': [72.8777, 19.076],
  'Bangalore': [77.5946, 12.9716],
  'Bengaluru': [77.5946, 12.9716],
  'Delhi': [77.1025, 28.7041],
  'New Delhi': [77.1025, 28.7041],
  'Chennai': [80.2707, 13.0827],
  'Hyderabad': [78.4867, 17.385],
  'Pune': [73.8567, 18.5204],
  'Kolkata': [88.3639, 22.5726],
  'Dubai': [55.2708, 25.2048],
  'Toronto': [-79.3832, 43.6532],
  'Vancouver': [-123.1207, 49.2827],
  'Amsterdam': [4.9041, 52.3676],
  'Stockholm': [18.0686, 59.3293],
  'São Paulo': [-46.6333, -23.5505],
  'Melbourne': [144.9631, -37.8136],
  'Hong Kong': [114.1694, 22.3193],
  'Shanghai': [121.4737, 31.2304],
  'Beijing': [116.4074, 39.9042],
}

// Country center coordinates as fallback
export const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-95.7129, 37.0902],
  'United Kingdom': [-3.436, 55.3781],
  'India': [78.9629, 20.5937],
  'Germany': [10.4515, 51.1657],
  'France': [2.2137, 46.2276],
  'Canada': [-106.3468, 56.1304],
  'Australia': [133.7751, -25.2744],
  'Japan': [138.2529, 36.2048],
  'Singapore': [103.8198, 1.3521],
  'Netherlands': [5.2913, 52.1326],
  'Brazil': [-51.9253, -14.235],
  'China': [104.1954, 35.8617],
  'UAE': [53.8478, 23.4241],
  'South Korea': [127.7669, 35.9078],
  'Sweden': [18.6435, 60.1282],
  'Spain': [-3.7492, 40.4637],
  'Italy': [12.5674, 41.8719],
  'Russia': [105.3188, 61.524],
  'Mexico': [-102.5528, 23.6345],
  'Indonesia': [113.9213, -0.7893],
}

export async function getGeoFromIP(ip: string): Promise<GeoData> {
  // Skip for localhost/private IPs
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null }
  }

  // Check cache
  const cached = geoCache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // ip-api.com free tier - no API key needed
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })

    if (!response.ok) {
      return { country: null, city: null }
    }

    const data = await response.json()

    if (data.status === 'success') {
      const geoData: GeoData = {
        country: data.country || null,
        city: data.city || null,
      }

      // Cache the result
      geoCache.set(ip, { data: geoData, timestamp: Date.now() })

      return geoData
    }

    return { country: null, city: null }
  } catch (error) {
    // Don't fail on geo-lookup errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Geo lookup error:', error)
    }
    return { country: null, city: null }
  }
}

// Get coordinates for a city or country
export function getCoordinates(city: string | null, country: string | null): [number, number] | null {
  if (city && cityCoordinates[city]) {
    return cityCoordinates[city]
  }
  if (country && countryCoordinates[country]) {
    return countryCoordinates[country]
  }
  return null
}

// Cleanup old cache entries (call periodically)
export function cleanupGeoCache(): void {
  const now = Date.now()
  for (const [key, value] of geoCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      geoCache.delete(key)
    }
  }
}
