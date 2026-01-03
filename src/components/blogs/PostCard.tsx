'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaCalendar, FaClock, FaComment } from 'react-icons/fa'
import { BlogPostWithRelations } from '@/lib/queries/posts'

interface PostCardProps {
  post: BlogPostWithRelations
  index?: number
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const readTime = Math.ceil(post.content.split(' ').length / 200) // Approximate reading time

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {post.featuredImage && (
        <div className="h-64 bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!post.featuredImage && (
        <div className="h-64 bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400 flex items-center justify-center">
          <div className="text-white text-6xl font-bold">
            {post.title.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="p-8">
        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4 flex-wrap">
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
          {post._count.comments > 0 && (
            <div className="flex items-center">
              <FaComment className="mr-2" size={14} />
              {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          <Link
            href={`/blogs/${post.slug}`}
            className="hover:text-primary-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {(post.categories.length > 0 || post.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((pc) => (
              <Link
                key={pc.category.id}
                href={`/blogs/category/${pc.category.slug}`}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
              >
                {pc.category.name}
              </Link>
            ))}
            {post.tags.map((pt) => (
              <Link
                key={pt.tag.id}
                href={`/blogs/tag/${pt.tag.slug}`}
                className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm hover:bg-accent-200 transition-colors"
              >
                #{pt.tag.name}
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/blogs/${post.slug}`}
          className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
        >
          Read More →
        </Link>
      </div>
    </motion.article>
  )
}

