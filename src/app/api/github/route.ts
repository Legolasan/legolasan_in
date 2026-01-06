import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIP } from '@/lib/rateLimit'

// Cache the GitHub data for 1 hour
let cachedData: any = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

const GITHUB_USERNAME = 'Legolasan'

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
  bio: string | null
}

async function fetchGitHubData() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Website',
  }

  // Add token if available (for higher rate limits)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  try {
    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`)
    }

    const user: GitHubUser = await userResponse.json()

    // Fetch repositories (sorted by updated)
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    )

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`)
    }

    const repos: GitHubRepo[] = await reposResponse.json()

    // Calculate language stats
    const languageStats: Record<string, number> = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
      }
    })

    // Sort languages by count
    const topLanguages = Object.entries(languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }))

    // Total stars and forks
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0)

    return {
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        publicRepos: user.public_repos,
        followers: user.followers,
        following: user.following,
        bio: user.bio,
      },
      repos: repos.map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updatedAt: repo.updated_at,
      })),
      stats: {
        totalStars,
        totalForks,
        topLanguages,
      },
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { success } = rateLimiters.relaxed.check(ip)
    
    if (!success) {
      // If rate limited but have cached data, return it
      if (cachedData) {
        return NextResponse.json({ ...cachedData, rateLimited: true })
      }
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Check if we have valid cached data
    const now = Date.now()
    if (cachedData && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedData)
    }

    // Fetch fresh data
    const data = await fetchGitHubData()
    
    // Update cache
    cachedData = data
    cacheTime = now

    return NextResponse.json(data)
  } catch (error) {
    console.error('GitHub API error:', error)
    
    // If we have cached data, return it even if stale
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        stale: true,
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}

