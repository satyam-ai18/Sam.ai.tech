import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://mkconvent.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/mission-vision',
    '/academics',
    '/facilities',
    '/campus-life',
    '/teachers',
    '/achievements',
    '/gallery',
    '/news',
    '/events',
    '/notices',
    '/admissions',
    '/admissions/apply',
    '/admissions/status',
    '/contact',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic CMS Pages
  let pages: MetadataRoute.Sitemap = []
  try {
    const publishedPages = await prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })
    pages = publishedPages.map((p) => ({
      url: `${siteUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    // ignore
  }

  // Dynamic News Articles
  let news: MetadataRoute.Sitemap = []
  try {
    const publishedNews = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })
    news = publishedNews.map((n) => ({
      url: `${siteUrl}/news/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch {
    // ignore
  }

  // Dynamic Gallery Albums
  let albums: MetadataRoute.Sitemap = []
  try {
    const publishedAlbums = await prisma.galleryAlbum.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })
    albums = publishedAlbums.map((a) => ({
      url: `${siteUrl}/gallery/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch {
    // ignore
  }

  return [...staticRoutes, ...pages, ...news, ...albums]
}
