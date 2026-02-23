import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Learn from '@/components/Learn'

export const metadata: Metadata = {
  title: 'Learn | Arun Sundararajan',
  description: 'Interactive learning modules for mastering databases, SQL, and data engineering concepts. Hands-on experimentation with real-time visualization.',
  keywords: ['SQL', 'MySQL', 'learning', 'database', 'tutorial', 'interactive'],
}

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <Learn />
      <Footer />
    </main>
  )
}
