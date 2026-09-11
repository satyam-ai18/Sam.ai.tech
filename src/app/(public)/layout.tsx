import type { Metadata } from 'next'
import { Navbar } from '@/components/public/layout/Navbar'
import { Footer } from '@/components/public/layout/Footer'
import { prisma } from '@/lib/db'

import { SCHOOL_INFO } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const DEFAULT_NAV_ITEMS = [
  { id: 'nav-1', label: 'Home', url: '/', target: '_self' },
  { id: 'nav-2', label: 'About Us', url: '/about', target: '_self' },
  { id: 'nav-3', label: 'Academics', url: '/academics', target: '_self' },
  { id: 'nav-4', label: 'Facilities', url: '/facilities', target: '_self' },
  { id: 'nav-5', label: 'Admissions', url: '/admissions', target: '_self' },
  { id: 'nav-6', label: 'Gallery', url: '/gallery', target: '_self' },
  { id: 'nav-7', label: 'Notices', url: '/notices', target: '_self' },
  { id: 'nav-8', label: 'News & Events', url: '/news', target: '_self' },
  { id: 'nav-9', label: 'Contact', url: '/contact', target: '_self' },
]

const DEFAULT_SETTINGS_MAP: Record<string, string> = {
  site_name: SCHOOL_INFO.name,
  site_short_name: SCHOOL_INFO.shortName,
  site_tagline: SCHOOL_INFO.tagline,
  contact_phone: SCHOOL_INFO.phone,
  contact_email: SCHOOL_INFO.email,
  contact_address: `${SCHOOL_INFO.address}, ${SCHOOL_INFO.city}, ${SCHOOL_INFO.state} - ${SCHOOL_INFO.pincode}`,
  contact_whatsapp: SCHOOL_INFO.whatsapp,
  social_facebook: SCHOOL_INFO.facebook,
  social_youtube: SCHOOL_INFO.youtube,
  admission_open: 'true',
  admission_year: '2026-2027',
  footer_about_text: 'A premier Co-Ed English Medium institution committed to academic excellence and holistic development of every child.',
  footer_copyright: `© ${new Date().getFullYear()} Maa Kaushilya Convent School. All rights reserved.`,
}

async function getLayoutData() {
  try {
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
    const settingsMap = { ...DEFAULT_SETTINGS_MAP, ...Object.fromEntries(settings.map((s) => [s.key, s.value])) }
    return { settingsMap, navItems: navItems.length > 0 ? navItems : DEFAULT_NAV_ITEMS }
  } catch (error) {
    console.warn('Database not available for layout, using defaults:', error)
    return { settingsMap: DEFAULT_SETTINGS_MAP, navItems: DEFAULT_NAV_ITEMS }
  }
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
