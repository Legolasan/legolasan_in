import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Tools from '@/components/Tools'

export const metadata: Metadata = {
  title: 'Tools | Arun Sundararajan',
  description: 'A collection of tools and utilities built to solve real-world problems in analytics, testing, security, and productivity.',
  keywords: ['tools', 'utilities', 'automation', 'CLI', 'Python', 'open source'],
}

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <Tools />
      <Footer />
    </main>
  )
}
