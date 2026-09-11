'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

interface AdminSessionProviderProps {
  children: React.ReactNode
  session: Session | null
}

export function AdminSessionProvider({ children, session }: AdminSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
