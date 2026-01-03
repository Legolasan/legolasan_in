import { getPostBySlug } from '@/lib/queries/posts'
import { notFound } from 'next/navigation'
import CommentSection from '@/components/blogs/CommentSection'
import Link from 'next/link'
import { FaArrowLeft, FaCalendar, FaClock, FaComment } from 'react-icons/fa'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post || post.status !== 'published') {
    notFound()
  }

  const readTime = Math.ceil(post.content.split(' ').length / 200)

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

        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {post.featuredImage && (
            <div className="h-96 overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              {post.title}
            </h1>

            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4 flex-wrap">
              <div className="flex items-center">
                <FaCalendar className="mr-2" size={14} />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not published'}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2" size={14} />
                {readTime} min read
              </div>
              {post.comments.length > 0 && (
                <div className="flex items-center">
                  <FaComment className="mr-2" size={14} />
                  {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </div>
              )}
            </div>

            {(post.categories.length > 0 || post.tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.categories.map((pc) => (
                  <Link
                    key={pc.category.id}
                    href={`/blogs?category=${pc.category.slug}`}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                  >
                    {pc.category.name}
                  </Link>
                ))}
                {post.tags.map((pt) => (
                  <Link
                    key={pt.tag.id}
                    href={`/blogs?tag=${pt.tag.slug}`}
                    className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm hover:bg-accent-200 transition-colors"
                  >
                    #{pt.tag.name}
                  </Link>
                ))}
              </div>
            )}

            {post.excerpt && (
              <div className="text-xl text-gray-600 mb-8 italic border-l-4 border-primary-600 pl-4">
                {post.excerpt}
              </div>
            )}

            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center space-x-4">
                {post.author.image && (
                  <img
                    src={post.author.image}
                    alt={post.author.name || post.author.email}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-800">
                    {post.author.name || post.author.email}
                  </div>
                  <div className="text-sm text-gray-500">Author</div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="max-w-4xl mx-auto mt-12">
          <CommentSection
            postId={post.id}
            initialComments={post.comments.map((c) => ({
              id: c.id,
              authorName: c.authorName,
              authorEmail: c.authorEmail,
              content: c.content,
              createdAt: c.createdAt,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

