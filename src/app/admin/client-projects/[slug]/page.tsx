'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCopy, FaExternalLinkAlt, FaSave, FaComments } from 'react-icons/fa';

interface ClientProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  githubRepo: string | null;
  vercelUrl: string | null;
  customDomain: string | null;
  accessToken: string;
  accessEnabled: boolean;
  status: string;
  createdAt: string;
  _count: {
    feedback: number;
  };
}

export default function ClientProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    githubRepo: '',
    vercelUrl: '',
    customDomain: '',
    status: 'active',
    accessEnabled: true
  });

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/client-projects/${slug}`);

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
      setFormData({
        name: data.project.name,
        description: data.project.description || '',
        githubRepo: data.project.githubRepo || '',
        vercelUrl: data.project.vercelUrl || '',
        customDomain: data.project.customDomain || '',
        status: data.project.status,
        accessEnabled: data.project.accessEnabled
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/client-projects/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      setProject(data.project);
      setCopySuccess('Changes saved successfully!');
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type} copied to clipboard!`);
      setTimeout(() => setCopySuccess(''), 3000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const getWidgetEmbedCode = () => {
    if (!project) return '';
    return `<!-- Legolasan Feedback Widget -->
<script>
  window.LEGOLASAN_FEEDBACK_CONFIG = {
    projectId: '${project.slug}',
    apiUrl: 'https://legolasan.in/api',
    token: '${project.accessToken}'
  };
</script>
<script src="https://legolasan.in/feedback-widget/widget.js" defer></script>`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <p className="text-red-800 dark:text-red-300 text-lg">Project not found</p>
          <Link
            href="/admin/client-projects"
            className="inline-block mt-4 text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/client-projects"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
        >
          <FaArrowLeft />
          Back to Projects
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-mono">
              /{project.slug}
            </p>
          </div>
          <Link
            href={`/admin/client-projects/${project.slug}/feedback`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaComments />
            View Feedback ({project._count.feedback})
          </Link>
        </div>
      </div>

      {copySuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-green-800 dark:text-green-300">✓ {copySuccess}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Widget Embed Code */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-6 mb-6 border border-purple-200 dark:border-purple-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔌 Widget Embed Code
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Add this code to the <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded">&lt;head&gt;</code> section of your client's website:
        </p>
        <div className="relative">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {getWidgetEmbedCode()}
          </pre>
          <button
            onClick={() => copyToClipboard(getWidgetEmbedCode(), 'Embed code')}
            className="absolute top-2 right-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
          >
            <FaCopy />
            Copy
          </button>
        </div>
      </div>

      {/* Access Token */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔑 Access Token
        </h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">
            {project.accessToken}
          </code>
          <button
            onClick={() => copyToClipboard(project.accessToken, 'Access token')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaCopy />
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Keep this token secure. It allows feedback submission for this project.
        </p>
      </div>

      {/* Project Details Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Project Settings
        </h2>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div>
          <label htmlFor="vercelUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Preview URL
          </label>
          <input
            type="url"
            id="vercelUrl"
            value={formData.vercelUrl}
            onChange={(e) => setFormData({ ...formData, vercelUrl: e.target.value })}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {formData.vercelUrl && (
            <a
              href={formData.vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <FaExternalLinkAlt />
              Open Preview
            </a>
          )}
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label htmlFor="accessEnabled" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Access
            </label>
            <select
              id="accessEnabled"
              value={formData.accessEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setFormData({ ...formData, accessEnabled: e.target.value === 'enabled' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
