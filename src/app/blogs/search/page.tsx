import { searchPosts } from '@/lib/queries/posts'
import PostCard from '@/components/blogs/PostCard'
import SearchBar from '@/components/blogs/SearchBar'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

interface PageProps {
  searchParams: {
    q?: string
    page?: string
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')

  let posts: any[] = []
  let pagination = { page: 1, limit: 10, total: 0, totalPages: 0 }

  if (query.trim()) {
    const result = await searchPosts(query, page, 10)
    posts = result.posts
    pagination = result.pagination
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="container mx-auto px-4 py-20">
        <Link
          href="/blogs"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-semibold"
        >
          <FaArrowLeft className="mr-2" />
          Back to Blog
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Search Results
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto mb-4"></div>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {!query.trim() ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Enter a search query to find blog posts.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No results found for &quot;{query}&quot;. Try a different search term.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {pagination.total} result{pagination.total !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 mb-12">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/blogs/search?q=${encodeURIComponent(query)}&page=${pagination.page - 1}`}
                    className="px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all text-primary-600 font-semibold"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                {pagination.page < pagination.totalPages && (
                  <Link
                    href={`/blogs/search?q=${encodeURIComponent(query)}&page=${pagination.page + 1}`}
                    className="px-6 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all text-primary-600 font-semibold"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

