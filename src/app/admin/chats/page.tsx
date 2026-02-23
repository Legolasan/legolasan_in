'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaRobot, FaUser, FaTrash, FaTimes, FaDesktop, FaMobile, FaGlobe, FaChrome } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

interface ChatSession {
  id: string
  sessionId: string
  ipAddress: string | null
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  startedAt: string
  endedAt: string | null
  _count: {
    messages: number
  }
  messages: { content: string; role: string }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fetchSessions = async (page = 1, searchQuery = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/chats?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setSessions(data.sessions)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionMessages = async (sessionId: string) => {
    setLoadingMessages(true)
    try {
      const response = await fetch(`/api/chats?sessionId=${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setSessionMessages(data.session.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) return

    try {
      const response = await fetch(`/api/chats?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (selectedSession === sessionId) {
        setSelectedSession(null)
        setSessionMessages([])
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchSessionMessages(selectedSession)
    }
  }, [selectedSession])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSessions(1, search)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDeviceIcon = (device: string | null) => {
    if (device === 'mobile') return <FaMobile className="text-gray-500" />
    return <FaDesktop className="text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Chat Conversations</h1>
        <div className="text-sm text-gray-500">
          {pagination && `${pagination.total} total conversations`}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by content, location, browser..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-700">Sessions</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaRobot size={48} className="mx-auto mb-4 opacity-50" />
              <p>No chat conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession === session.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDeviceIcon(session.device)}
                        <span className="text-sm font-medium text-gray-800">
                          {session.browser || 'Unknown'} on {session.os || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(session.startedAt)}
                        {session.country && ` • ${session.city || ''} ${session.country}`}
                      </p>
                      {session.messages[0] && (
                        <p className="text-sm text-gray-600 truncate">
                          {session.messages[0].role === 'user' ? '👤' : '🤖'}{' '}
                          {session.messages[0].content.substring(0, 100)}
                          {session.messages[0].content.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {session._count.messages} msgs
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete session"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchSessions(pagination.page - 1, search)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchSessions(pagination.page + 1, search)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Conversation View */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Conversation</h2>
            {selectedSession && (
              <button
                onClick={() => {
                  setSelectedSession(null)
                  setSessionMessages([])
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {!selectedSession ? (
            <div className="p-8 text-center text-gray-500">
              <FaRobot size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a session to view the conversation</p>
            </div>
          ) : loadingMessages ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {sessionMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-accent-100 text-accent-600'
                      }`}
                    >
                      {message.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                    </div>
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

