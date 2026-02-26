'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function NewClientProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    githubRepo: '',
    vercelUrl: '',
    customDomain: '',
    status: 'active'
  });

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      // Auto-generate slug from name if slug is empty or was auto-generated
      slug: formData.slug === slugify(formData.name) || !formData.slug
        ? slugify(name)
        : formData.slug
    });
  };

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/client-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      // Redirect to project details page
      router.push(`/admin/client-projects/${data.project.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/client-projects"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
        >
          <FaArrowLeft />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Project
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up a new client project to start collecting feedback
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            maxLength={200}
            placeholder="Client A Website Redesign"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            A descriptive name for the client project
          </p>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            URL Slug *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">/</span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
              required
              maxLength={100}
              pattern="^[a-z0-9-]+$"
              placeholder="client-a-website"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL-friendly identifier (lowercase letters, numbers, hyphens only)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            maxLength={10000}
            placeholder="E-commerce website redesign with modern UI/UX..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Brief description of the project (optional)
          </p>
        </div>

        <div>
          <label htmlFor="githubRepo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            GitHub Repository
          </label>
          <input
            type="url"
            id="githubRepo"
            value={formData.githubRepo}
            onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
            maxLength={500}
            placeholder="https://github.com/username/project"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Link to the project repository (optional)
          </p>
        </div>

        <div>
          <label htmlFor="vercelUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Preview URL (Vercel/Netlify)
          </label>
          <input
            type="url"
            id="vercelUrl"
            value={formData.vercelUrl}
            onChange={(e) => setFormData({ ...formData, vercelUrl: e.target.value })}
            maxLength={500}
            placeholder="https://project-name.vercel.app"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Public preview URL (you can add this later)
          </p>
        </div>

        <div>
          <label htmlFor="customDomain" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Custom Domain
          </label>
          <input
            type="text"
            id="customDomain"
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            maxLength={200}
            placeholder="client-name.legolasan.in"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Custom domain if configured (optional)
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Project
              </>
            )}
          </button>
          <Link
            href="/admin/client-projects"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
