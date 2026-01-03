'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [catsRes, tagsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags'),
      ])
      const [cats, tags] = await Promise.all([catsRes.json(), tagsRes.json()])
      setCategories(cats)
      setTags(tags)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCategory ? '/api/categories' : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory
        ? { id: editingCategory.id, ...formData }
        : { ...formData, slug: formData.slug || generateSlug(formData.name) }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchData()
        setShowCategoryForm(false)
        setEditingCategory(null)
        setFormData({ name: '', slug: '', description: '' })
      } else {
        alert('Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category')
    }
  }

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/tags'
      const method = editingTag ? 'PUT' : 'POST'
      const body = editingTag
        ? { id: editingTag.id, name: formData.name, slug: formData.slug || generateSlug(formData.name) }
        : { name: formData.name, slug: formData.slug || generateSlug(formData.name) }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        fetchData()
        setShowTagForm(false)
        setEditingTag(null)
        setFormData({ name: '', slug: '', description: '' })
      } else {
        alert('Failed to save tag')
      }
    } catch (error) {
      console.error('Error saving tag:', error)
      alert('Error saving tag')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category')
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      const response = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to delete tag')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('Error deleting tag')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Categories & Tags</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <button
              onClick={() => {
                setShowCategoryForm(true)
                setEditingCategory(null)
                setFormData({ name: '', slug: '', description: '' })
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FaPlus />
              <span>Add Category</span>
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCategorySubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: formData.slug || generateSlug(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                    setFormData({ name: '', slug: '', description: '' })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-800">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.slug}</div>
                  {cat.description && (
                    <div className="text-sm text-gray-600 mt-1">{cat.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{cat._count.posts} posts</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat)
                      setFormData({
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description || '',
                      })
                      setShowCategoryForm(true)
                    }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tags</h2>
            <button
              onClick={() => {
                setShowTagForm(true)
                setEditingTag(null)
                setFormData({ name: '', slug: '', description: '' })
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <FaPlus />
              <span>Add Tag</span>
            </button>
          </div>

          {showTagForm && (
            <form onSubmit={handleTagSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <input
                type="text"
                placeholder="Tag Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: formData.slug || generateSlug(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
                >
                  {editingTag ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTagForm(false)
                    setEditingTag(null)
                    setFormData({ name: '', slug: '', description: '' })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-800">#{tag.name}</div>
                  <div className="text-sm text-gray-500">{tag.slug}</div>
                  <div className="text-xs text-gray-400 mt-1">{tag._count.posts} posts</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTag(tag)
                      setFormData({
                        name: tag.name,
                        slug: tag.slug,
                        description: '',
                      })
                      setShowTagForm(true)
                    }}
                    className="p-2 text-accent-600 hover:bg-accent-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

