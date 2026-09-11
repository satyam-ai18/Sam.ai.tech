import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/lib/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) {
          return null
        }

        // Check if account is temporarily locked
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          console.warn(`User ${email} is locked out until ${user.lockoutUntil}`)
          return null
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordValid) {
          const nextAttempts = user.failedAttempts + 1
          const shouldLock = nextAttempts >= 5
          const lockoutUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: nextAttempts,
              lockoutUntil,
            },
          })

          try {
            const { logActivity } = await import('@/lib/audit')
            await logActivity({
              userId: user.id,
              userName: user.name,
              action: 'FAILED_LOGIN',
              module: 'auth',
              details: `Failed password attempt (${nextAttempts})${shouldLock ? ' - Account locked for 15m' : ''}`,
            })
          } catch {}

          return null
        }

        // Successful login: reset failed attempts, update lastLogin, log activity
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockoutUntil: null,
            lastLogin: new Date(),
          },
        })

        try {
          const { logActivity } = await import('@/lib/audit')
          await logActivity({
            userId: user.id,
            userName: user.name,
            action: 'LOGIN',
            module: 'auth',
            details: `User logged in successfully`,
          })
        } catch {}

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
})
