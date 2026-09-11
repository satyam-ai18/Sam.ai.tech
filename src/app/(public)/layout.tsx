import type { Metadata } from 'next'
import { Navbar } from '@/components/public/layout/Navbar'
import { Footer } from '@/components/public/layout/Footer'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getLayoutData() {
  const [settings, navItems] = await Promise.all([
    prisma.setting.findMany(),
    prisma.navigationItem.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    }),
  ])
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  return { settingsMap, navItems }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settingsMap, navItems } = await getLayoutData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settingsMap.site_name || 'Maa Kaushilya Convent School',
    alternateName: 'MK Convent School',
    url: 'https://mkconvent.com',
    logo: settingsMap.site_logo || 'https://mkconvent.com/logo.png',
    telephone: settingsMap.contact_phone || '+91-8858514567',
    email: settingsMap.contact_email || 'mkconventschool@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sukkhipur, Shakarmandi, Post Sadar',
      addressLocality: 'Jaunpur',
      addressRegion: 'Uttar Pradesh',
      postalCode: '222001',
      addressCountry: 'IN',
    },
    sameAs: [
      settingsMap.social_facebook,
      settingsMap.social_youtube,
      settingsMap.social_instagram,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar settings={settingsMap} navItems={navItems} />
      {children}
      <Footer settings={settingsMap} />
    </>
  )
}
