import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { UsersAdminClient } from './UsersAdminClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User & Role Management | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await auth()
  const currentUserId = (session?.user as any)?.id

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'System' }, { label: 'Users & Roles' }]} />
      <UsersAdminClient
        initialUsers={users.map((u) => ({
          ...u,
          lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
          createdAt: u.createdAt.toISOString(),
        }))}
        currentUserId={currentUserId}
      />
    </div>
  )
}
