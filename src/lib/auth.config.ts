import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'mk-convent-school-secret-key-32chars-min-jwt',
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role as string
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },
  providers: [],
}
