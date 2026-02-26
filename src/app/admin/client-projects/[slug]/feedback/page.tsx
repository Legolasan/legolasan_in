'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaFilter, FaDownload, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

interface Feedback {
  id: string;
  content: string;
  pageUrl: string;
  pagePath: string;
  elementSelector: string | null;
  elementText: string | null;
  elementHtml: string | null;
  screenshotData: string | null;
  positionX: number | null;
  positionY: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  clientName: string | null;
  clientEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  priority: string | null;
  category: string | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientProject {
  name: string;
  slug: string;
}

export default function FeedbackDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/client-projects/${slug}`);
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject({ name: projectData.project.name, slug: projectData.project.slug });
      }

      // Fetch feedback
      const feedbackRes = await fetch(`/api/client-feedback?projectSlug=${slug}`);
      if (!feedbackRes.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData.feedback);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/client-feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      // Refresh feedback list
      await fetchData();

      // Update selected feedback if it's the same one
      if (selectedFeedback?.id === id) {
        const data = await response.json();
        setSelectedFeedback(data.feedback);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const updateFeedbackPriority = async (id: string, priority: string) => {
    try {
      const response = await fetch('/api/client-feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, priority })
      });

      if (!response.ok) {
        throw new Error('Failed to update priority');
      }

      await fetchData();

      if (selectedFeedback?.id === id) {
        const data = await response.json();
        setSelectedFeedback(data.feedback);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const exportCSV = () => {
    window.open(`/api/client-feedback/export?projectSlug=${slug}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: any }> = {
      open: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: FaExclamationCircle },
      in_progress: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: FaClock },
      resolved: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: FaCheckCircle },
      archived: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: FaCheckCircle }
    };

    const config = styles[status] || styles.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
        <Icon className="text-xs" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority || priority === 'normal') return null;

    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const filteredFeedback = feedback.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (filterPriority !== 'all' && f.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link
          href={`/admin/client-projects/${slug}`}
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
        >
          <FaArrowLeft />
          Back to Project
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Feedback Dashboard
            </h1>
            {project && (
              <p className="text-gray-600 dark:text-gray-400">
                {project.name} • {filteredFeedback.length} feedback items
              </p>
            )}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 flex gap-4 items-center">
        <FaFilter className="text-gray-500" />
        <div className="flex gap-4 flex-1">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {filteredFeedback.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No feedback yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Feedback will appear here once clients start using the widget
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFeedback(item)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border-2 ${
                selectedFeedback?.id === item.id
                  ? 'border-purple-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-900 dark:text-white mb-3">
                  {item.content}
                </p>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Page:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.pagePath}
                    </code>
                  </div>
                  {item.clientName && (
                    <div>
                      <span className="font-semibold">From:</span> {item.clientName}
                      {item.clientEmail && ` (${item.clientEmail})`}
                    </div>
                  )}
                  {item.elementText && (
                    <div>
                      <span className="font-semibold">Element:</span>{' '}
                      <span className="text-xs">{item.elementText.substring(0, 50)}...</span>
                    </div>
                  )}
                </div>

                {item.screenshotData && (
                  <div className="mt-4">
                    <img
                      src={item.screenshotData}
                      alt="Feedback screenshot"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex gap-2">
                {item.status !== 'in_progress' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFeedbackStatus(item.id, 'in_progress');
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Start
                  </button>
                )}
                {item.status !== 'resolved' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFeedbackStatus(item.id, 'resolved');
                    }}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                )}
                {item.priority !== 'high' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFeedbackPriority(item.id, 'high');
                    }}
                    className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    High Priority
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feedback Details
                </h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => updateFeedbackStatus(selectedFeedback.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedFeedback.priority || 'normal'}
                    onChange={(e) => updateFeedbackPriority(selectedFeedback.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content</h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  {selectedFeedback.content}
                </p>
              </div>

              {selectedFeedback.screenshotData && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Screenshot</h3>
                  <img
                    src={selectedFeedback.screenshotData}
                    alt="Feedback screenshot"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Page URL</h3>
                  <a
                    href={selectedFeedback.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {selectedFeedback.pageUrl}
                  </a>
                </div>

                {selectedFeedback.elementSelector && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Element Selector</h3>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block break-all">
                      {selectedFeedback.elementSelector}
                    </code>
                  </div>
                )}

                {selectedFeedback.clientName && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Client Name</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedFeedback.clientName}</p>
                  </div>
                )}

                {selectedFeedback.clientEmail && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Client Email</h3>
                    <a
                      href={`mailto:${selectedFeedback.clientEmail}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedFeedback.clientEmail}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Submitted</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </p>
                </div>

                {selectedFeedback.resolvedAt && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resolved</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {new Date(selectedFeedback.resolvedAt).toLocaleString()}
                      {selectedFeedback.resolvedBy && ` by ${selectedFeedback.resolvedBy}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
