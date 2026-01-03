import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'

// Validate environment variables at startup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('[WARN] Google OAuth credentials not configured')
}
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  console.warn('[WARN] GitHub OAuth credentials not configured')
}
if (!process.env.NEXTAUTH_URL) {
  console.warn('[WARN] NEXTAUTH_URL not configured')
}
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[WARN] NEXTAUTH_SECRET not configured')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    async createUser({ user }) {
      // When a new user is created, check if they're the first user and make them admin
      try {
        const userCount = await prisma.user.count()
        if (userCount === 1) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          })
          console.log(`First user ${user.email} set as admin`)
        }
      } catch (error) {
        console.error('Error setting admin role:', error)
      }
    },
    async linkAccount({ account, user }) {
      // Update User model with provider info when account is linked
      if (account && user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH] signIn callback called:', {
        email: user.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      })
      
      // Let PrismaAdapter handle account linking with allowDangerousEmailAccountLinking enabled
      // Just update provider info in User model if needed
      if (user.email && account) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (existingUser) {
            console.log('[AUTH] Existing user found:', { id: existingUser.id, role: existingUser.role })
            
            // Update provider info if not set or different
            if (!existingUser.provider || existingUser.provider !== account.provider) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  provider: account.provider,
                  providerId: account.providerAccountId,
                },
              })
              console.log('[AUTH] Updated provider info for user')
            }

            // Ensure first user has admin role
            const userCount = await prisma.user.count()
            if (userCount === 1 && existingUser.role !== 'admin') {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: 'admin' },
              })
              console.log(`[AUTH] First user ${user.email} set as admin`)
            }
          } else {
            console.log('[AUTH] New user signing in:', user.email)
          }
        } catch (error) {
          console.error('[AUTH] Error in signIn callback:', error)
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // JWT callback - called on every request with JWT strategy
      if (user) {
        // First time sign in - get role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true },
        })
        token.id = dbUser?.id || user.id
        token.role = dbUser?.role || 'user'
        token.email = user.email
        console.log('[AUTH] JWT populated on sign in:', { id: token.id, role: token.role, email: token.email })
      } else if (token.email) {
        // Subsequent requests - refresh role from database to catch updates
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role || 'user'
        }
      }
      return token
    },
    async session({ session, token }) {
      // Session callback - populate session from JWT token
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/blogs/admin/login',
    error: '/blogs/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

