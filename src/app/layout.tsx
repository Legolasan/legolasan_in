import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/context/ThemeContext'
import Analytics from '@/components/Analytics'
import ChatBot from '@/components/ChatBot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portfolio - Full Stack Developer',
  description: 'Personal portfolio website showcasing projects, skills, and experience',
  keywords: ['portfolio', 'developer', 'web development', 'full stack'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>
            <Analytics />
            {children}
            {/* <ChatBot /> */}{/* Hidden for now */}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

