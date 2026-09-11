import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import {
  Users, FileText, Calendar, Bell, Image as ImageIcon, MessageSquare,
  UserCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Plus,
  Globe, Navigation, Settings, ShieldAlert, History, Building2, Trophy, FolderOpen
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, StatCard } from '@/components/admin/ui/Card'
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/admin/ui/Table'
import { getRecentAuditLogs } from '@/lib/audit'
import { DashboardControlRoom } from './DashboardControlRoom'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Control Room & Live Analytics | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await auth()
  const userRole = (session?.user as any)?.role || 'EDITOR'
  const userName = session?.user?.name || session?.user?.email || 'Administrator'

  // Comprehensive parallel queries across all school entities
  const [
    totalAdmissions,
    newAdmissions,
    underReviewAdmissions,
    approvedAdmissions,
    rejectedAdmissions,
    publishedNews,
    upcomingEvents,
    activeNotices,
    galleryAlbums,
    totalTeachers,
    totalFacilities,
    totalAchievements,
    totalMedia,
    recentAdmissions,
    admissionsList,
    recentNews,
    recentEvents,
    recentPages,
    recentLogs,
  ] = await Promise.all([
    prisma.admission.count(),
    prisma.admission.count({ where: { status: 'SUBMITTED' } }),
    prisma.admission.count({ where: { status: { in: ['UNDER_REVIEW', 'VERIFIED'] } } }),
    prisma.admission.count({ where: { status: 'APPROVED' } }),
    prisma.admission.count({ where: { status: 'REJECTED' } }),
    prisma.news.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.count({ where: { startDate: { gte: new Date() }, status: 'PUBLISHED' } }),
    prisma.notice.count({ where: { isPublished: true } }),
    prisma.galleryAlbum.count({ where: { isActive: true } }),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.facility.count({ where: { isActive: true } }),
    prisma.achievement.count({ where: { isVisible: true } }),
    prisma.media.count(),
    prisma.admission.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        studentFirstName: true,
        studentLastName: true,
        classApplied: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.admission.findMany({
      select: {
        classApplied: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.news.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, status: true, publishedAt: true },
    }),
    prisma.event.findMany({
      take: 4,
      orderBy: { startDate: 'asc' },
      select: { id: true, title: true, startDate: true, location: true, status: true },
    }),
    prisma.page.findMany({
      take: 4,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
    }),
    getRecentAuditLogs(8),
  ])

  // Process Admissions by Class
  const classCountMap: Record<string, number> = {}
  admissionsList.forEach((a) => {
    const c = a.classApplied || 'Unspecified'
    classCountMap[c] = (classCountMap[c] || 0) + 1
  })
  const classStats = Object.entries(classCountMap)
    .map(([className, count]) => ({ className, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)

  // Process Admissions by Status
  const statusStats = [
    { status: 'SUBMITTED', count: newAdmissions, color: 'hsl(220, 70%, 45%)' },
    { status: 'UNDER_REVIEW', count: underReviewAdmissions, color: 'hsl(40, 92%, 40%)' },
    { status: 'APPROVED', count: approvedAdmissions, color: 'hsl(142, 72%, 36%)' },
    { status: 'REJECTED', count: rejectedAdmissions, color: 'hsl(0, 75%, 45%)' },
  ]

  // Process Monthly trend (last 4 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const monthlyStats: Array<{ month: string; count: number }> = []
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mLabel = monthNames[d.getMonth()]
    const count = admissionsList.filter((a) => {
      const created = new Date(a.createdAt)
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear()
    }).length
    monthlyStats.push({ month: mLabel, count })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(220, 35%, 15%)', margin: 0 }}>
            Welcome, {userName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(220, 15%, 50%)', margin: '0.25rem 0 0 0' }}>
            Maa Kaushilya Convent School CMS Control Room & Live Operational Dashboard
          </p>
        </div>
      </div>

      {/* 13 Live Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.125rem' }}>
        <StatCard
          title="Total Admissions"
          value={totalAdmissions}
          icon={<UserCheck size={20} />}
          description="Total online applicant records"
        />
        <StatCard
          title="New Applications"
          value={newAdmissions}
          icon={<Clock size={20} />}
          description="Submitted & awaiting review"
          trend="Action Required"
          trendUp={false}
        />
        <StatCard
          title="Under Review"
          value={underReviewAdmissions}
          icon={<Clock size={20} />}
          description="Document verification stage"
        />
        <StatCard
          title="Approved Enrolled"
          value={approvedAdmissions}
          icon={<CheckCircle2 size={20} />}
          description="Enrolled for session 2026-27"
          trend="Confirmed"
          trendUp={true}
        />
        <StatCard
          title="Rejected"
          value={rejectedAdmissions}
          icon={<AlertCircle size={20} />}
          description="Ineligible or declined"
        />
        <StatCard
          title="Published News"
          value={publishedNews}
          icon={<FileText size={20} />}
          description="Live news articles & stories"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents}
          icon={<Calendar size={20} />}
          description="Scheduled calendar items"
        />
        <StatCard
          title="Active Notices"
          value={activeNotices}
          icon={<Bell size={20} />}
          description="Live board announcements"
        />
        <StatCard
          title="Gallery Albums"
          value={galleryAlbums}
          icon={<ImageIcon size={20} />}
          description="Published photo collections"
        />
        <StatCard
          title="Teachers & Staff"
          value={totalTeachers}
          icon={<Users size={20} />}
          description="Faculty & academic leadership"
        />
        <StatCard
          title="Campus Facilities"
          value={totalFacilities}
          icon={<Building2 size={20} />}
          description="Infrastructure records"
        />
        <StatCard
          title="Achievements"
          value={totalAchievements}
          icon={<Trophy size={20} />}
          description="Student & school awards"
        />
        <StatCard
          title="Media Assets"
          value={totalMedia}
          icon={<FolderOpen size={20} />}
          description="Institutional files & photos"
        />
      </div>

      {/* Control Room Core (Omni Search, Quick Actions, Analytics, Exports, Logs) */}
      <DashboardControlRoom
        userRole={userRole}
        userName={userName}
        totalAdmissions={totalAdmissions}
        classStats={classStats}
        statusStats={statusStats}
        monthlyStats={monthlyStats}
        recentAdmissions={recentAdmissions}
        recentNews={recentNews}
        recentEvents={recentEvents}
        recentPages={recentPages}
        recentLogs={recentLogs}
      />
    </div>
  )
}
