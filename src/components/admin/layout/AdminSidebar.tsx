'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { canAccessRoute } from '@/lib/permissions'
import {
  LayoutDashboard, Settings, Home, Image, Users, GraduationCap,
  Building2, BookOpen, Trophy, MessageSquare, Calendar, Bell,
  Star, FileText, Contact, Search, LogOut, Menu, X, ChevronDown,
  ChevronRight, Globe, Palette, Navigation, AlignLeft, Footprints,
  Award, UserCheck, Shield, FolderOpen, BarChart3, History
} from 'lucide-react'
import styles from './sidebar.module.css'

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  children?: { label: string; href: string; icon?: React.ReactNode }[]
  badge?: number
}

interface SidebarProps {
  stats?: {
    newAdmissions?: number
    pendingComplaints?: number
    pendingNotices?: number
  }
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/admin/dashboard' },
  {
    label: 'Website',
    icon: <Globe size={18} />,
    children: [
      { label: 'Website Overview', href: '/admin/website', icon: <Globe size={15} /> },
      { label: 'General Settings', href: '/admin/website/general', icon: <Settings size={15} /> },
      { label: 'Homepage Builder', href: '/admin/website/homepage', icon: <Home size={15} /> },
      { label: 'Header & Nav', href: '/admin/website/header', icon: <Navigation size={15} /> },
      { label: 'Footer', href: '/admin/website/footer', icon: <Footprints size={15} /> },
      { label: 'Theme Colors', href: '/admin/website/theme', icon: <Palette size={15} /> },
    ],
  },
  { label: 'Pages', icon: <FileText size={18} />, href: '/admin/pages' },
  { label: 'Homepage', icon: <Home size={18} />, href: '/admin/homepage' },
  { label: 'Navigation', icon: <Navigation size={18} />, href: '/admin/navigation' },
  { label: 'Academics', icon: <BookOpen size={18} />, href: '/admin/academics' },
  { label: 'Facilities', icon: <Building2 size={18} />, href: '/admin/facilities' },
  { label: 'Teachers', icon: <Users size={18} />, href: '/admin/teachers' },
  { label: 'Admissions', icon: <UserCheck size={18} />, href: '/admin/admissions' },
  { label: 'News', icon: <FileText size={18} />, href: '/admin/news' },
  { label: 'Events', icon: <Calendar size={18} />, href: '/admin/events' },
  { label: 'Notices', icon: <Bell size={18} />, href: '/admin/notices' },
  { label: 'Achievements', icon: <Trophy size={18} />, href: '/admin/achievements' },
  { label: 'Testimonials', icon: <Star size={18} />, href: '/admin/testimonials' },
  { label: 'Gallery', icon: <Image size={18} />, href: '/admin/gallery' },
  { label: 'Media Library', icon: <FolderOpen size={18} />, href: '/admin/media' },
  { label: 'Complaints', icon: <MessageSquare size={18} />, href: '/admin/complaints' },
  { label: 'Contact', icon: <Contact size={18} />, href: '/admin/contact' },
  { label: 'SEO', icon: <Search size={18} />, href: '/admin/seo' },
  { label: 'Users', icon: <Shield size={18} />, href: '/admin/users' },
  { label: 'Audit Logs', icon: <History size={18} />, href: '/admin/audit-logs' },
  { label: 'Settings', icon: <Settings size={18} />, href: '/admin/settings' },
]

export function AdminSidebar({ stats }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role

  const [expanded, setExpanded] = useState<string[]>(['Website'])
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleExpand = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isGroupActive = (children: { href: string }[]) =>
    children.some(c => isActive(c.href))

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  // Filter sidebar items strictly based on role permissions
  const visibleNavItems = navItems.filter((item) => {
    if (item.href) return canAccessRoute(userRole, item.href)
    if (item.children) {
      return item.children.some((c) => canAccessRoute(userRole, c.href))
    }
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <GraduationCap size={22} strokeWidth={1.5} />
          </div>
          <div>
            <div className={styles.logoName}>MK Convent</div>
            <div className={styles.logoSub}>Admin Panel</div>
          </div>
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className={styles.nav} aria-label="Admin navigation">
          {visibleNavItems.map((item) => {
            if (item.children) {
              const groupActive = isGroupActive(item.children)
              const isExpanded = expanded.includes(item.label)

              return (
                <div key={item.label}>
                  <button
                    className={`${styles.navGroup} ${groupActive ? styles.active : ''}`}
                    onClick={() => toggleExpand(item.label)}
                    aria-expanded={isExpanded}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <span className={styles.chevron}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className={styles.subNav}>
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`${styles.subNavItem} ${isActive(child.href) ? styles.active : ''}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.icon && <span>{child.icon}</span>}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`${styles.navItem} ${isActive(item.href!) ? styles.active : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className={styles.badge}>{item.badge}</span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.viewSiteBtn} target="_blank">
            <Globe size={15} />
            View Website
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
