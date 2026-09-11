import type { NextAuthConfig } from 'next-auth'

export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'mk-convent-school-secret-key-32chars-min-jwt'

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: AUTH_SECRET,
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
