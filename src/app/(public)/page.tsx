import { prisma } from '@/lib/db'
import { HeroSection } from '@/components/public/home/HeroSection'
import { AdmissionBanner } from '@/components/public/home/AdmissionBanner'
import { AnnouncementBar } from '@/components/public/home/AnnouncementBar'
import { NoticeBoardSection } from '@/components/public/home/NoticeBoardSection'
import { QuickInfo } from '@/components/public/home/QuickInfo'
import { AboutSection } from '@/components/public/home/AboutSection'
import { WhyUsSection } from '@/components/public/home/WhyUsSection'
import { PrincipalMessage } from '@/components/public/home/PrincipalMessage'
import { AcademicsSection } from '@/components/public/home/AcademicsSection'
import { FacilitiesSection } from '@/components/public/home/FacilitiesSection'
import { CampusLifeSection } from '@/components/public/home/CampusLifeSection'
import { AchievementsSection } from '@/components/public/home/AchievementsSection'
import { StaffSection } from '@/components/public/home/StaffSection'
import { GalleryPreview } from '@/components/public/home/GalleryPreview'
import { NewsSection } from '@/components/public/home/NewsSection'
import { EventsSection } from '@/components/public/home/EventsSection'
import { TestimonialsSection } from '@/components/public/home/TestimonialsSection'
import { AdmissionProcess } from '@/components/public/home/AdmissionProcess'
import { StatsSection } from '@/components/public/home/StatsSection'
import { ContactCTA } from '@/components/public/home/ContactCTA'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Real SEO meta from https://mkconvent.com/
export const metadata: Metadata = {
  title: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School | MK Convent School',
  description:
    'Looking for the best Co-Ed CBSE English medium school in Jaunpur? MK Convent School in Sukkhipur offers quality academics, science lab, computer lab, and sports facilities. Admissions open 2026-2027!',
  keywords: 'Primary School, Convent School, Best School in Jaunpur, Jaunpur, schools in Jaunpur, kids school in jaunpur, admission in school, MK Convent',
}

async function getHomeData() {
  const [
    sections,
    heroSlides,
    aboutData,
    principalData,
    coreValues,
    academics,
    facilities,
    teachers,
    galleryAlbums,
    achievements,
    news,
    events,
    testimonials,
    notices,
    settings,
  ] = await Promise.all([
    prisma.homepageSection.findMany({ orderBy: { order: 'asc' } }),
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.aboutSection.findFirst({ where: { key: 'about', isVisible: true } }),
    prisma.aboutSection.findFirst({ where: { key: 'principal', isVisible: true } }),
    prisma.coreValue.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 6 }),
    prisma.academic.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 4 }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 8 }),
    prisma.teacher.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 4 }),
    prisma.galleryAlbum.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
      take: 6,
      include: { media: { take: 4, orderBy: { order: 'asc' } } },
    }),
    prisma.achievement.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' }, take: 6 }),
    prisma.news.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 3 }),
    prisma.event.findMany({ where: { status: 'PUBLISHED', startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 3 }),
    prisma.testimonial.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' }, take: 6 }),
    prisma.notice.findMany({ where: { isPublished: true }, orderBy: { date: 'desc' }, take: 5 }),
    prisma.setting.findMany(),
  ])

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return {
    sections,
    heroSlides,
    aboutData,
    principalData,
    coreValues,
    academics,
    facilities,
    teachers,
    galleryAlbums,
    achievements,
    news,
    events,
    testimonials,
    notices,
    settingsMap,
  }
}

export default async function HomePage() {
  const data = await getHomeData()

  return (
    <main id="main-content">
      {/* Dynamic Homepage Sections */}
      {data.sections.map((sec) => {
        if (!sec.isVisible) return null

        switch (sec.sectionId) {
          case 'announcement':
            return data.notices.length > 0 ? (
              <AnnouncementBar key={sec.id} notices={data.notices} />
            ) : null

          case 'hero':
            return <HeroSection key={sec.id} slides={data.heroSlides} />

          case 'admission_banner':
            return <AdmissionBanner key={sec.id} settings={data.settingsMap} />

          case 'quick_info':
            return <QuickInfo key={sec.id} settings={data.settingsMap} />

          // Dedicated Notice Board section — CMS managed via Admin → Notices
          case 'notice_board':
            return data.notices.length > 0 ? (
              <NoticeBoardSection key={sec.id} notices={data.notices} />
            ) : null

          case 'about':
            return data.aboutData ? (
              <AboutSection key={sec.id} about={data.aboutData} />
            ) : null

          case 'why_us':
            return <WhyUsSection key={sec.id} facilities={data.facilities} values={data.coreValues} />

          case 'principal':
            return data.principalData ? (
              <PrincipalMessage key={sec.id} principal={data.principalData} />
            ) : null

          case 'academics':
            return data.academics.length > 0 ? (
              <AcademicsSection key={sec.id} academics={data.academics} />
            ) : null

          case 'facilities':
            return data.facilities.length > 0 ? (
              <FacilitiesSection key={sec.id} facilities={data.facilities} />
            ) : null

          case 'campus_life':
            return <CampusLifeSection key={sec.id} />

          case 'achievements':
            return data.achievements.length > 0 ? (
              <AchievementsSection key={sec.id} achievements={data.achievements} />
            ) : null

          case 'teachers':
            return data.teachers.length > 0 ? (
              <StaffSection key={sec.id} teachers={data.teachers} />
            ) : null

          case 'gallery':
            return data.galleryAlbums.length > 0 ? (
              <GalleryPreview key={sec.id} albums={data.galleryAlbums} />
            ) : null

          case 'stats':
            return <StatsSection key={sec.id} />

          case 'news':
            return data.news.length > 0 ? (
              <NewsSection key={sec.id} news={data.news} />
            ) : null

          case 'events':
            return data.events.length > 0 ? (
              <EventsSection key={sec.id} events={data.events} />
            ) : null

          case 'testimonials':
            return data.testimonials.length > 0 ? (
              <TestimonialsSection key={sec.id} testimonials={data.testimonials} />
            ) : null

          case 'admission_process':
            return <AdmissionProcess key={sec.id} />

          case 'contact_cta':
            return <ContactCTA key={sec.id} settings={data.settingsMap} />

          default:
            return null
        }
      })}
    </main>
  )
}
