import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, handleApiError } from '@/lib/errors'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return errorResponse(401)

    const userRole = (session.user as any)?.role
    const q = req.nextUrl.searchParams.get('q')?.trim() || ''

    if (!q || q.length < 2) {
      return successResponse({ results: [] })
    }

    const results: Array<{
      id: string
      title: string
      subtitle?: string
      type: string
      url: string
    }> = []

    // Parallel searches respecting permissions
    const promises: Promise<any>[] = []

    // 1. Pages
    if (hasPermission(userRole, PERMISSIONS.MANAGE_PAGES)) {
      promises.push(
        prisma.page
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { slug: { contains: q } }],
            },
            take: 4,
          })
          .then((pages) => {
            pages.forEach((p) => {
              results.push({
                id: p.id,
                title: p.title,
                subtitle: `CMS Page (/${p.slug}) · ${p.status}`,
                type: 'page',
                url: `/admin/pages`,
              })
            })
          })
      )
    }

    // 2. News
    if (hasPermission(userRole, PERMISSIONS.MANAGE_NEWS)) {
      promises.push(
        prisma.news
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { excerpt: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((n) => {
              results.push({
                id: n.id,
                title: n.title,
                subtitle: `News Article · ${n.category} (${n.status})`,
                type: 'news',
                url: `/admin/news`,
              })
            })
          })
      )
    }

    // 3. Events
    if (hasPermission(userRole, PERMISSIONS.MANAGE_EVENTS)) {
      promises.push(
        prisma.event
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { location: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((e) => {
              results.push({
                id: e.id,
                title: e.title,
                subtitle: `Event · ${e.location || 'Campus'} (${e.status})`,
                type: 'event',
                url: `/admin/events`,
              })
            })
          })
      )
    }

    // 4. Notices
    if (hasPermission(userRole, PERMISSIONS.MANAGE_NOTICES)) {
      promises.push(
        prisma.notice
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { description: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((n) => {
              results.push({
                id: n.id,
                title: n.title,
                subtitle: `Notice Board · ${n.category}`,
                type: 'notice',
                url: `/admin/notices`,
              })
            })
          })
      )
    }

    // 5. Teachers
    if (hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS)) {
      promises.push(
        prisma.teacher
          .findMany({
            where: {
              OR: [{ name: { contains: q } }, { department: { contains: q } }, { designation: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((t) => {
              results.push({
                id: t.id,
                title: t.name,
                subtitle: `Faculty · ${t.designation} (${t.department})`,
                type: 'teacher',
                url: `/admin/teachers`,
              })
            })
          })
      )
    }

    // 6. Facilities
    if (hasPermission(userRole, PERMISSIONS.MANAGE_FACILITIES)) {
      promises.push(
        prisma.facility
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { description: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((f) => {
              results.push({
                id: f.id,
                title: f.title,
                subtitle: `Campus Facility`,
                type: 'facility',
                url: `/admin/facilities`,
              })
            })
          })
      )
    }

    // 7. Achievements
    if (hasPermission(userRole, PERMISSIONS.MANAGE_ACHIEVEMENTS)) {
      promises.push(
        prisma.achievement
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { studentName: { contains: q } }, { award: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((a) => {
              results.push({
                id: a.id,
                title: a.title,
                subtitle: `Achievement · ${a.studentName || a.category}`,
                type: 'achievement',
                url: `/admin/achievements`,
              })
            })
          })
      )
    }

    // 8. Gallery
    if (hasPermission(userRole, PERMISSIONS.MANAGE_GALLERY)) {
      promises.push(
        prisma.galleryAlbum
          .findMany({
            where: {
              OR: [{ title: { contains: q } }, { category: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((g) => {
              results.push({
                id: g.id,
                title: g.title,
                subtitle: `Gallery Album · ${g.category}`,
                type: 'gallery',
                url: `/admin/gallery`,
              })
            })
          })
      )
    }

    // 9. Media
    if (hasPermission(userRole, PERMISSIONS.MANAGE_MEDIA)) {
      promises.push(
        prisma.media
          .findMany({
            where: {
              OR: [{ originalName: { contains: q } }, { title: { contains: q } }, { altText: { contains: q } }],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((m) => {
              results.push({
                id: m.id,
                title: m.title || m.originalName,
                subtitle: `Media File (${m.type})`,
                type: 'media',
                url: `/admin/media`,
              })
            })
          })
      )
    }

    // 10. Admissions
    if (hasPermission(userRole, PERMISSIONS.MANAGE_ADMISSIONS)) {
      promises.push(
        prisma.admission
          .findMany({
            where: {
              OR: [
                { referenceNumber: { contains: q } },
                { studentFirstName: { contains: q } },
                { studentLastName: { contains: q } },
                { fatherName: { contains: q } },
                { phone: { contains: q } },
              ],
            },
            take: 4,
          })
          .then((items) => {
            items.forEach((adm) => {
              results.push({
                id: adm.id,
                title: `${adm.studentFirstName} ${adm.studentLastName}`,
                subtitle: `Admission (${adm.referenceNumber}) · ${adm.classApplied} [${adm.status}]`,
                type: 'admission',
                url: `/admin/admissions`,
              })
            })
          })
      )
    }

    await Promise.all(promises)

    return successResponse({ results })
  } catch (error) {
    return handleApiError(error)
  }
}
