import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { authConfig, AUTH_SECRET } from '@/lib/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: AUTH_SECRET,
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
        const password = credentials.password as string

        // Fast-path: Default Super Admin credentials
        if (
          email === 'admin@mkconvent.com' &&
          (password === 'admin@mkconvent2024' || password === 'admin@mkconvent')
        ) {
          return {
            id: 'super-admin-root',
            name: 'Super Admin',
            email: 'admin@mkconvent.com',
            role: 'SUPER_ADMIN',
          }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (user && user.isActive) {
            // Check if account is temporarily locked
            if (user.lockoutUntil && user.lockoutUntil > new Date()) {
              console.warn(`User ${email} is locked out until ${user.lockoutUntil}`)
              return null
            }

            const passwordValid = await bcrypt.compare(password, user.password)

            if (passwordValid) {
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    failedAttempts: 0,
                    lockoutUntil: null,
                    lastLogin: new Date(),
                  },
                })
              } catch {}

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            }
          }
        } catch (dbError) {
          console.warn('Database error in authorize:', dbError)
        }

        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
})
