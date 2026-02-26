'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPlus, FaExternalLinkAlt, FaComments, FaTrash, FaEdit } from 'react-icons/fa';

interface ClientProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  githubRepo: string | null;
  vercelUrl: string | null;
  customDomain: string | null;
  status: string;
  accessEnabled: boolean;
  createdAt: string;
  _count: {
    feedback: number;
  };
}

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/client-projects');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (slug: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated feedback.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/client-projects/${slug}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Refresh list
      fetchProjects();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.active}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Client Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage client preview projects and feedback
          </p>
        </div>
        <Link
          href="/admin/client-projects/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <FaPlus />
          New Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No projects yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first client project to get started with feedback collection
          </p>
          <Link
            href="/admin/client-projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <FaPlus />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      /{project.slug}
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <FaComments />
                    <span className="font-semibold">{project._count.feedback}</span>
                    <span className="text-gray-500 dark:text-gray-400">feedback</span>
                  </div>
                </div>

                {project.vercelUrl && (
                  <a
                    href={project.vercelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
                  >
                    <FaExternalLinkAlt />
                    Preview Site
                  </a>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/admin/client-projects/${project.slug}`}
                    className="flex-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-center font-medium flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Manage
                  </Link>
                  <Link
                    href={`/admin/client-projects/${project.slug}/feedback`}
                    className="flex-1 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-center font-medium flex items-center justify-center gap-2"
                  >
                    <FaComments />
                    Feedback
                  </Link>
                  <button
                    onClick={() => deleteProject(project.slug, project.name)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete Project"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
