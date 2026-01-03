import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/queries/posts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json({ posts: [], pagination: { page, limit, total: 0, totalPages: 0 } })
    }

    const result = await searchPosts(query, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching posts:', error)
    return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 })
  }
}

