import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminSessionProvider } from '@/components/admin/layout/AdminSessionProvider'
import { ToastProvider } from '@/components/admin/ui/Toast'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import styles from './admin.module.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AdminSessionProvider session={session}>
      <ToastProvider>
        <div className={styles.adminApp}>
          <AdminSidebar />
          <div className={styles.adminMain}>
            {/* Top Bar */}
            <header className={styles.topBar}>
              <div className={styles.topBarLeft}>
                <div className={styles.pageTitle} id="admin-page-title" />
              </div>
              <div className={styles.topBarRight}>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewSiteLink}
                  title="View public school website"
                >
                  <span>View Live Site</span>
                  <ExternalLink size={14} />
                </Link>

                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{session?.user?.name}</span>
                    <span className={styles.userRole}>
                      {session?.user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className={styles.adminContent}>{children}</main>
          </div>
        </div>
      </ToastProvider>
    </AdminSessionProvider>
  )
}
