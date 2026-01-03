'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaFileAlt, FaComments, FaTags, FaEye } from 'react-icons/fa'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    pendingComments: 0,
  })

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((posts) => {
        const published = posts.filter((p: any) => p.status === 'published').length
        const drafts = posts.filter((p: any) => p.status === 'draft').length
        setStats((prev) => ({
          ...prev,
          totalPosts: posts.length,
          publishedPosts: published,
          draftPosts: drafts,
        }))
      })

    fetch('/api/comments?status=pending')
      .then((res) => res.json())
      .then((comments) => {
        setStats((prev) => ({
          ...prev,
          pendingComments: comments.length,
        }))
      })

    fetch('/api/comments')
      .then((res) => res.json())
      .then((comments) => {
        setStats((prev) => ({
          ...prev,
          totalComments: comments.length,
        }))
      })
  }, [])

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Posts</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPosts}</p>
            </div>
            <FaFileAlt className="text-primary-600" size={40} />
          </div>
          <div className="mt-4 flex space-x-2 text-sm">
            <span className="text-green-600">{stats.publishedPosts} published</span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-600">{stats.draftPosts} drafts</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Comments</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalComments}</p>
            </div>
            <FaComments className="text-accent-600" size={40} />
          </div>
          {stats.pendingComments > 0 && (
            <div className="mt-4">
              <Link
                href="/blogs/admin/comments"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                {stats.pendingComments} pending →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Quick Actions</p>
            </div>
            <FaEye className="text-secondary-600" size={40} />
          </div>
          <div className="mt-4 space-y-2">
            <Link
              href="/blogs/admin/posts/new"
              className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center transition-colors"
            >
              New Post
            </Link>
            <Link
              href="/blogs"
              target="_blank"
              className="block w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center transition-colors"
            >
              View Blog
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/blogs/admin/posts"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaFileAlt className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Manage Posts</h3>
            <p className="text-sm text-gray-600">Create, edit, and delete blog posts</p>
          </Link>
          <Link
            href="/blogs/admin/categories"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaTags className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Categories & Tags</h3>
            <p className="text-sm text-gray-600">Organize your content</p>
          </Link>
          <Link
            href="/blogs/admin/comments"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
          >
            <FaComments className="text-primary-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Moderate Comments</h3>
            <p className="text-sm text-gray-600">Approve or reject comments</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

