import { getPublishedPosts } from '@/lib/queries/posts'
import PostCard from '@/components/blogs/PostCard'
import SearchBar from '@/components/blogs/SearchBar'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

interface PageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
  }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const categorySlug = searchParams.category
  const tagSlug = searchParams.tag

  const { posts, pagination } = await getPublishedPosts(page, 10, categorySlug, tagSlug)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="container mx-auto px-4 py-20">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-semibold"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Blog
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about web development
          </p>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No blog posts found.</p>
          </div>
        ) : (
          <>
            <div className="max-w-4xl mx-auto space-y-8 mb-12">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                {pagination.page > 1 && (
                  <Link
                    href={`/blogs?page=${pagination.page - 1}${categorySlug ? `&category=${categorySlug}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
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
                    href={`/blogs?page=${pagination.page + 1}${categorySlug ? `&category=${categorySlug}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
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

