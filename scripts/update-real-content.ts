/**
 * Real Content Update Script for MK Convent School
 * Source: https://mkconvent.com/ (read directly)
 * 
 * Updates all placeholder/fake/AI-generated content with real data
 * from the actual school website.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateRealContent() {
  console.log('🌱 Updating database with real content from mkconvent.com...\n')

  // ─── 1. Real Settings from actual website ─────────────────────────────
  const realSettings = [
    // Real contact info from footer of mkconvent.com
    { key: 'site_name', value: 'Maa Kaushilya Convent School' },
    { key: 'site_short_name', value: 'MK Convent' },
    { key: 'site_tagline', value: 'Nurturing Minds, Building Character' },
    { key: 'site_description', value: 'MK Convent School is a Co-Ed English Medium CBSE-pattern institution in Sukkhipur, Jaunpur — an autonomous, charitable, non-profit school committed to giving pupils a solid foundation in a safe and nurturing environment.' },
    // Real contact — from mkconvent.com header & footer
    { key: 'contact_phone', value: '8858514567' },
    { key: 'contact_phone_2', value: '' },
    { key: 'contact_email', value: 'mkconventschool@gmail.com' },
    { key: 'contact_whatsapp', value: '8858514567' },
    // Real address — from mkconvent.com footer
    { key: 'contact_address', value: 'Sukkhipur, Shakarmandi, Post Sadar, Jaunpur, Uttar Pradesh' },
    { key: 'contact_office_hours', value: 'Monday – Saturday: 8:00 AM – 3:00 PM' },
    // Social — only Facebook & YouTube shown on mkconvent.com
    { key: 'social_facebook', value: 'https://www.facebook.com/Mk-Convent-School-107325068627370/' },
    { key: 'social_youtube', value: 'https://www.youtube.com/channel/UCCuvXs6Ob7GvpEIPYJkz4zA' },
    { key: 'social_instagram', value: '' },
    { key: 'social_twitter', value: '' },
    // Admissions — from mkconvent.com marquee/news
    { key: 'admission_open', value: 'true' },
    { key: 'admission_year', value: '2026-2027' },
    { key: 'admission_deadline', value: '' }, // not specified on the real website
    { key: 'admission_banner_text', value: 'Admissions open for academic session 2026-2027 — contact us and enroll your child today.' },
    // Footer text — honest about the school
    { key: 'footer_about_text', value: 'Maa Kaushilya Convent School is a Co-Ed English Medium institution in Sukkhipur, Jaunpur, established with the vision of our founder Late Kamla Devi — committed to quality education and the holistic development of every child.' },
    { key: 'footer_copyright', value: `© ${new Date().getFullYear()} Maa Kaushilya Convent School (mkconvent.com). All rights reserved.` },
    // SEO — from actual meta tags on mkconvent.com
    { key: 'seo_title', value: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School' },
    { key: 'seo_description', value: 'Looking for the best Co-Ed CBSE English medium school in Jaunpur? MK Convent School in Sukkhipur offers quality academics, science lab, computer lab, and sports facilities. Admissions open 2026-2027!' },
    { key: 'seo_keywords', value: 'best school in jaunpur, CBSE school jaunpur, MK convent school, english medium school jaunpur, primary school jaunpur, convent school jaunpur' },
  ]

  for (const s of realSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value, group: 'general' },
    })
  }
  console.log('✅ Settings updated with real contact, social, admission info')

  // ─── 2. Real Hero Slides ──────────────────────────────────────────────
  // Based on actual mkconvent.com homepage content and banner image
  await prisma.heroSlide.deleteMany()
  await prisma.heroSlide.createMany({
    data: [
      {
        heading: 'Admissions Open for Academic Year 2026-2027',
        subheading: 'MK Convent School — Co-Ed English Medium School in Jaunpur. Secure your child\'s future with quality education in a safe, nurturing environment.',
        badge: '📢 Admissions Open 2026-2027',
        primaryBtnText: 'Apply Online',
        primaryBtnUrl: '/admissions/apply',
        secondaryBtnText: 'Know More',
        secondaryBtnUrl: '/about',
        // Real banner image from mkconvent.com
        backgroundImage: 'https://www.mkconvent.com/uploads/gallery/media/v-4banner4.jpg',
        overlayIntensity: 50,
        order: 1,
        isActive: true,
      },
      {
        heading: 'Maa Kaushilya Convent School, Jaunpur',
        subheading: 'An autonomous, charitable, non-profit educational institution. Founded with the vision of Late Kamla Devi — Sukkhipur, Shakarmandi, Jaunpur.',
        badge: 'Co-Ed CBSE Pattern School',
        primaryBtnText: 'Contact Us',
        primaryBtnUrl: '/contact',
        secondaryBtnText: 'About School',
        secondaryBtnUrl: '/about',
        backgroundImage: 'https://www.mkconvent.com/uploads/gallery/media/v-4banner4.jpg',
        overlayIntensity: 60,
        order: 2,
        isActive: true,
      },
    ],
  })
  console.log('✅ Hero slides updated with real content & real banner image')

  // ─── 3. Real About Section ───────────────────────────────────────────
  // From mkconvent.com/page/about-us and homepage content
  await prisma.aboutSection.upsert({
    where: { key: 'about' },
    update: {
      heading: 'About Maa Kaushilya Convent School',
      subheading: 'A Trusted Co-Ed English Medium School in Jaunpur',
      content: `<p>Established with the guiding vision of our founder, <strong>Late Kamla Devi</strong>, MK Convent School is a Co-Ed English Medium CBSE-pattern institution. Located in <strong>Sukkhipur, Shakarmandi, Jaunpur</strong>, our autonomous, charitable, and non-profit educational institution is deeply committed to giving pupils a solid foundation in a safe and nurturing environment.</p>
<p>We believe in allowing every student's natural gifts to unfold, making learning a deeply pleasurable and interactive experience. It is our privilege to make your child's educational journey smooth, engaging, and rooted in strong moral values.</p>
<p>Our school has spacious, well-ventilated classrooms and special activity rooms for enrichment — including a media room, smart classes, and an on-campus library. The school is also equipped with a computer lab with internet access.</p>`,
      image: 'https://www.mkconvent.com/uploads/gallery/media/mk-convent-school-jaunpur-founder-kamla-devi.jfif',
      imageAlt: 'Late Kamla Devi — Founder, Maa Kaushilya Convent School',
      isVisible: true,
    },
    create: {
      key: 'about',
      heading: 'About Maa Kaushilya Convent School',
      subheading: 'A Trusted Co-Ed English Medium School in Jaunpur',
      content: `<p>Established with the guiding vision of our founder, <strong>Late Kamla Devi</strong>, MK Convent School is a Co-Ed English Medium CBSE-pattern institution. Located in <strong>Sukkhipur, Shakarmandi, Jaunpur</strong>, our autonomous, charitable, and non-profit educational institution is deeply committed to giving pupils a solid foundation in a safe and nurturing environment.</p>
<p>We believe in allowing every student's natural gifts to unfold, making learning a deeply pleasurable and interactive experience. It is our privilege to make your child's educational journey smooth, engaging, and rooted in strong moral values.</p>
<p>Our school has spacious, well-ventilated classrooms and special activity rooms for enrichment — including a media room, smart classes, and an on-campus library. The school is also equipped with a computer lab with internet access.</p>`,
      image: 'https://www.mkconvent.com/uploads/gallery/media/mk-convent-school-jaunpur-founder-kamla-devi.jfif',
      imageAlt: 'Late Kamla Devi — Founder, Maa Kaushilya Convent School',
      isVisible: true,
      order: 1,
    },
  })
  console.log('✅ About section updated with real content + founder image')

  // ─── 4. Real Principal/Mission Message ───────────────────────────────
  // From mkconvent.com/page/our-mission (actual page content)
  await prisma.aboutSection.upsert({
    where: { key: 'principal' },
    update: {
      heading: "A Message from the School",
      subheading: 'Our Commitment to Your Child',
      content: `<p>It gives us great pleasure to welcome you to Maa Kaushilya Convent School. We want to create a platform for students to express their creative pursuits, which develops in them originality of thought and perception.</p>
<p>Our major aim is to nurture the creativity and imagination of our students and help them progress in life. The education we impart at MK Convent lays the foundation of life and shapes its destiny.</p>
<p>With a strong commitment to the quest for excellence, MK Convent School is making steady progress in enhancing its potential — providing the best all-round quality education laced with moral values.</p>
<p><em>"May the sapling grow into a sturdy tree and spread its branches."</em></p>`,
      isVisible: true,
    },
    create: {
      key: 'principal',
      heading: "A Message from the School",
      subheading: 'Our Commitment to Your Child',
      content: `<p>It gives us great pleasure to welcome you to Maa Kaushilya Convent School. We want to create a platform for students to express their creative pursuits, which develops in them originality of thought and perception.</p>
<p>Our major aim is to nurture the creativity and imagination of our students and help them progress in life. The education we impart at MK Convent lays the foundation of life and shapes its destiny.</p>
<p>With a strong commitment to the quest for excellence, MK Convent School is making steady progress in enhancing its potential — providing the best all-round quality education laced with moral values.</p>
<p><em>"May the sapling grow into a sturdy tree and spread its branches."</em></p>`,
      isVisible: true,
      order: 4,
    },
  })
  console.log('✅ Principal message updated with real quote from mkconvent.com')

  // ─── 5. Real Core Values ─────────────────────────────────────────────
  // From mkconvent.com homepage "Our Vision for Student Success" section
  await prisma.coreValue.deleteMany()
  await prisma.coreValue.createMany({
    data: [
      {
        title: 'Quality Education',
        description: 'We ensure the overall development of students — academically, morally, and socially — in a nurturing environment.',
        icon: 'BookOpen',
        order: 1,
        isActive: true,
      },
      {
        title: 'Core Values',
        description: 'Propagating integrity, truth, and comprehensive growth to nurture the human spirit of every child.',
        icon: 'Shield',
        order: 2,
        isActive: true,
      },
      {
        title: 'Skilled Teachers',
        description: 'A wide range of subject-expert teachers affiliated with the school, committed to meaningful and interactive teaching.',
        icon: 'Users',
        order: 3,
        isActive: true,
      },
      {
        title: 'Library & Books',
        description: 'On-campus library for students to learn more, explore beyond textbooks, and develop a lifelong love of reading.',
        icon: 'BookMarked',
        order: 4,
        isActive: true,
      },
      {
        title: 'Physical & Sports',
        description: 'All-round development through physical sports, yoga, and activities — ensuring overall skill development of every student.',
        icon: 'Trophy',
        order: 5,
        isActive: true,
      },
      {
        title: 'Special Mentorship',
        description: 'Special mentorship for students who need extra support, so that every child can grow and compete with confidence.',
        icon: 'Heart',
        order: 6,
        isActive: true,
      },
    ],
  })
  console.log('✅ Core values updated with real mkconvent.com content')

  // ─── 6. Real Facilities — only what mkconvent.com actually shows ──────
  await prisma.facility.deleteMany()
  await prisma.facility.createMany({
    data: [
      {
        title: 'Science Lab',
        slug: 'science-lab',
        description: 'Lab for experiments in science to help students understand the principles and concepts of science through hands-on learning.',
        icon: 'FlaskConical',
        features: JSON.stringify(['Physics experiments', 'Chemistry workstations', 'Biology microscopes', 'Safety equipment']),
        order: 1,
        isActive: true,
      },
      {
        title: 'Computer Lab',
        slug: 'computer-lab',
        description: 'Computer education for all students to make them more confident in this digital era. Systems with internet access for learning.',
        icon: 'Laptop',
        features: JSON.stringify(['Computers with internet', 'Educational software', 'Digital literacy programs', 'Typing & basics']),
        order: 2,
        isActive: true,
      },
      {
        title: 'Library',
        slug: 'library',
        description: 'On-campus library for students to learn more, explore beyond textbooks, and build a strong reading habit.',
        icon: 'BookOpen',
        features: JSON.stringify(['Books for all classes', 'Reference section', 'Reading room', 'Story books']),
        order: 3,
        isActive: true,
      },
      {
        title: 'Spacious Classrooms',
        slug: 'classrooms',
        description: 'Spacious, well-ventilated classrooms that provide a comfortable and focused learning environment for all students.',
        icon: 'School',
        features: JSON.stringify(['Well-ventilated rooms', 'Proper seating', 'Good lighting', 'Conducive environment']),
        order: 4,
        isActive: true,
      },
      {
        title: 'Activity Rooms',
        slug: 'activity-rooms',
        description: 'Special activity rooms for enrichment — including a media room, smart classes, and spaces for music, dance, and performing arts.',
        icon: 'Music',
        features: JSON.stringify(['Media room', 'Smart class', 'Music room', 'Dance & arts room', 'Craft room']),
        order: 5,
        isActive: true,
      },
      {
        title: 'Sports & Physical Education',
        slug: 'sports',
        description: 'All-round development through physical sports, yoga, and other activities to ensure the overall skill development of students.',
        icon: 'Trophy',
        features: JSON.stringify(['Sports ground', 'Yoga sessions', 'Physical training', 'Team games']),
        order: 6,
        isActive: true,
      },
    ],
  })
  console.log('✅ Facilities updated — only real facilities from mkconvent.com')

  // ─── 7. Real Notices — from marquee on mkconvent.com ─────────────────
  // Keep existing notices, just add the real one from the website
  const existingRealNotice = await prisma.notice.findFirst({
    where: { title: { contains: 'Admissions open for academic session 2026-2027' } }
  })
  if (!existingRealNotice) {
    await prisma.notice.create({
      data: {
        title: 'Admissions open for academic session 2026-2027 — contact us and enroll your child today.',
        description: 'Maa Kaushilya Convent School is now accepting applications for all classes for the academic year 2026-2027. Dear Parents, secure your child\'s future with the best English medium education in Jaunpur. Contact us at 8858514567 for more details.',
        date: new Date('2026-02-22'),
        isImportant: true,
        isPublished: true,
      }
    })
  }
  console.log('✅ Real notice from mkconvent.com added')

  // ─── 8. Update News with real content ────────────────────────────────
  const existingNews = await prisma.news.findFirst({
    where: { slug: 'admissions-open-2026-2027' }
  })
  if (existingNews) {
    await prisma.news.update({
      where: { slug: 'admissions-open-2026-2027' },
      data: {
        title: 'Admissions Open for Academic Session 2026-2027',
        excerpt: 'Maa Kaushilya Convent School is now accepting applications for all classes. Contact us and enroll your child today.',
        content: `<p><strong>Dear Parents,</strong></p>
<p>Admissions are now open for the Academic Year <strong>2026-2027</strong> at Maa Kaushilya Convent School.</p>
<p>We invite you to secure your child's future with quality English medium education in Jaunpur. MK Convent School offers:</p>
<ul>
  <li>CBSE-pattern English Medium education</li>
  <li>Qualified and dedicated faculty</li>
  <li>Science Lab, Computer Lab, and Library</li>
  <li>Physical Education, Sports, and Yoga</li>
  <li>Special mentorship for students who need extra support</li>
  <li>Safe and nurturing campus environment</li>
</ul>
<p>For admission inquiries, please contact us at <strong>8858514567</strong> or visit our school at Sukkhipur, Shakarmandi, Post Sadar, Jaunpur during school hours (Mon–Sat, 8 AM – 3 PM).</p>`,
        publishedAt: new Date('2026-02-22'),
        status: 'PUBLISHED',
      }
    })
  }
  console.log('✅ News updated with real mkconvent.com admission announcement')

  // ─── 9. Remove fake teachers — school hasn't published real teacher info ──
  // The real website does NOT show teacher profiles, so we clear them
  await prisma.teacher.deleteMany()
  console.log('✅ Fake teacher profiles removed (real website does not list teachers)')

  // ─── 10. Remove fake achievements — school is ~4 years old ───────────
  // Real website does NOT list specific achievement records, so we clear them
  await prisma.achievement.deleteMany()
  console.log('✅ Fake achievement records removed (real website has none listed)')

  // ─── 11. Remove fake testimonials ────────────────────────────────────
  // Real website has no testimonials section
  await prisma.testimonial.deleteMany()
  console.log('✅ Fake testimonials removed (real website has none)')

  console.log('\n🎉 Real content update complete!')
  console.log('   → All info sourced from https://mkconvent.com/')
  console.log('   → No AI-generated or inflated content')
  console.log('   → Notice board entries manageable via Admin → Notices')
}

updateRealContent()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Update failed:', e)
    prisma.$disconnect()
    process.exit(1)
  })
