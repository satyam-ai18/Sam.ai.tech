import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { HOMEPAGE_SECTIONS } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── 1. Roles & Permissions ──────────────────────────────
  const rolesData = [
    { name: 'SUPER_ADMIN', description: 'Complete system access and administrative control' },
    { name: 'CONTENT_ADMIN', description: 'Can manage all website content, pages, academics, and media' },
    { name: 'ADMISSION_ADMIN', description: 'Can view, review, and manage admission applications and complaints' },
    { name: 'EDITOR', description: 'Can create and edit news, events, notices, and gallery items' },
  ]

  const seededRoles: Record<string, any> = {}
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    })
    seededRoles[r.name] = role
  }
  console.log('✅ Roles seeded: SUPER_ADMIN, CONTENT_ADMIN, ADMISSION_ADMIN, EDITOR')

  const permissionsList = [
    { name: 'manage_all', description: 'Super Admin full access' },
    { name: 'manage_website', description: 'Manage site settings, theme, header, footer' },
    { name: 'manage_pages', description: 'Create and edit CMS pages' },
    { name: 'manage_homepage', description: 'Configure homepage sections and layout' },
    { name: 'manage_navigation', description: 'Manage header and footer navigation' },
    { name: 'manage_academics', description: 'Manage academic programs and curriculum' },
    { name: 'manage_facilities', description: 'Manage school facilities' },
    { name: 'manage_teachers', description: 'Manage faculty and staff profiles' },
    { name: 'manage_admissions', description: 'Review and update admission applications' },
    { name: 'manage_news', description: 'Publish and manage school news articles' },
    { name: 'manage_events', description: 'Create and update school calendar events' },
    { name: 'manage_notices', description: 'Publish announcements and circulars' },
    { name: 'manage_achievements', description: 'Showcase student and school achievements' },
    { name: 'manage_testimonials', description: 'Manage parent and student testimonials' },
    { name: 'manage_gallery', description: 'Upload and organize photo albums' },
    { name: 'manage_media', description: 'Upload, organize, and delete media files' },
    { name: 'manage_complaints', description: 'Handle grievances and support inquiries' },
    { name: 'manage_contact', description: 'Manage contact details and messages' },
    { name: 'manage_seo', description: 'Configure metadata and SEO settings' },
    { name: 'manage_users', description: 'Create and manage admin users and roles' },
    { name: 'manage_settings', description: 'Modify core system configuration' },
  ]

  const seededPermissions: Record<string, any> = {}
  for (const p of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { name: p.name },
      update: { description: p.description },
      create: p,
    })
    seededPermissions[p.name] = perm
  }
  console.log(`✅ ${permissionsList.length} Permissions seeded`)

  // Assign permissions to roles
  await prisma.rolePermission.deleteMany()

  // SUPER_ADMIN gets all permissions
  for (const perm of Object.values(seededPermissions)) {
    await prisma.rolePermission.create({
      data: { roleId: seededRoles['SUPER_ADMIN'].id, permissionId: perm.id },
    })
  }

  // CONTENT_ADMIN
  const contentPermNames = [
    'manage_website', 'manage_pages', 'manage_homepage', 'manage_navigation',
    'manage_academics', 'manage_facilities', 'manage_teachers', 'manage_news',
    'manage_events', 'manage_notices', 'manage_achievements', 'manage_testimonials',
    'manage_gallery', 'manage_media', 'manage_contact', 'manage_seo',
  ]
  for (const name of contentPermNames) {
    if (seededPermissions[name]) {
      await prisma.rolePermission.create({
        data: { roleId: seededRoles['CONTENT_ADMIN'].id, permissionId: seededPermissions[name].id },
      })
    }
  }

  // ADMISSION_ADMIN
  const admissionPermNames = ['manage_admissions', 'manage_complaints']
  for (const name of admissionPermNames) {
    if (seededPermissions[name]) {
      await prisma.rolePermission.create({
        data: { roleId: seededRoles['ADMISSION_ADMIN'].id, permissionId: seededPermissions[name].id },
      })
    }
  }

  // EDITOR
  const editorPermNames = [
    'manage_pages', 'manage_news', 'manage_events', 'manage_notices',
    'manage_gallery', 'manage_media',
  ]
  for (const name of editorPermNames) {
    if (seededPermissions[name]) {
      await prisma.rolePermission.create({
        data: { roleId: seededRoles['EDITOR'].id, permissionId: seededPermissions[name].id },
      })
    }
  }
  console.log('✅ Role permissions mapped')

  // ─── 2. Super Admin User ──────────────────────────────
  const hashedPassword = await bcrypt.hash('admin@mkconvent2024', 12)
  await prisma.user.upsert({
    where: { email: 'admin@mkconvent.com' },
    update: {
      role: 'SUPER_ADMIN',
      roleId: seededRoles['SUPER_ADMIN'].id,
      status: 'ACTIVE',
      isActive: true,
    },
    create: {
      name: 'Super Admin',
      email: 'admin@mkconvent.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      roleId: seededRoles['SUPER_ADMIN'].id,
      status: 'ACTIVE',
      isActive: true,
    },
  })
  console.log('✅ Super Admin user seeded — email: admin@mkconvent.com | role: SUPER_ADMIN')

  // ─── 3. CMS Pages ─────────────────────────────────────
  const initialPages = [
    {
      title: 'About Maa Kaushilya Convent School',
      slug: 'about',
      content: '<p>Maa Kaushilya Convent School is a premier educational institution in Jaunpur, Uttar Pradesh, founded under the vision of Late Kamla Devi. Our school follows the CBSE pattern with an emphasis on both scholastic excellence and character building.</p>',
      status: 'PUBLISHED',
      createdBy: 'admin@mkconvent.com',
    },
    {
      title: 'Mission & Vision',
      slug: 'mission-vision',
      content: '<p><strong>Our Mission:</strong> To empower students to develop critical thinking, strong character, and a lifelong thirst for learning in a safe, inspiring environment.</p><p><strong>Our Vision:</strong> To be recognized as a center of educational excellence where every child reaches their highest potential.</p>',
      status: 'PUBLISHED',
      createdBy: 'admin@mkconvent.com',
    },
    {
      title: 'Campus Life',
      slug: 'campus-life',
      content: '<p>Life at MK Convent is vibrant and multidimensional. From interactive classroom discussions and science experiments to music, arts, and athletics, every student is encouraged to discover their talents.</p>',
      status: 'PUBLISHED',
      createdBy: 'admin@mkconvent.com',
    },
  ]

  for (const page of initialPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    })
  }
  console.log('✅ CMS Pages seeded: about, mission-vision, campus-life')

  // ─── Site Settings ────────────────────────────────────
  const settings = [
    // General
    { key: 'site_name', value: 'Maa Kaushilya Convent School', group: 'general' },
    { key: 'site_short_name', value: 'MK Convent', group: 'general' },
    { key: 'site_tagline', value: 'Where Learning Builds Character & Future', group: 'general' },
    { key: 'site_description', value: 'MK Convent School is a premium Co-Ed English Medium CBSE institution in Jaunpur, Uttar Pradesh, committed to holistic education.', group: 'general' },
    { key: 'site_logo', value: '', group: 'general' },
    { key: 'site_favicon', value: '', group: 'general' },
    // Contact
    { key: 'contact_phone', value: '8858514567', group: 'contact' },
    { key: 'contact_phone_2', value: '', group: 'contact' },
    { key: 'contact_email', value: 'mkconventschool@gmail.com', group: 'contact' },
    { key: 'contact_address', value: 'Sukkhipur, Shakarmandi, Post Sadar, Jaunpur, Uttar Pradesh - 222001', group: 'contact' },
    { key: 'contact_office_hours', value: 'Monday - Saturday: 8:00 AM - 4:00 PM', group: 'contact' },
    { key: 'contact_whatsapp', value: '8858514567', group: 'contact' },
    { key: 'contact_map_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115239.45!2d82.68!3d25.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDQzJzQ4LjAiTiA4MsKwNDAnNDguMCJF!5e0!3m2!1sen!2sin!4v1234567890', group: 'contact' },
    // Social
    { key: 'social_facebook', value: 'https://www.facebook.com/Mk-Convent-School-107325068627370/', group: 'social' },
    { key: 'social_youtube', value: 'https://www.youtube.com/channel/UCCuvXs6Ob7GvpEIPYJkz4zA', group: 'social' },
    { key: 'social_instagram', value: '', group: 'social' },
    { key: 'social_twitter', value: '', group: 'social' },
    // Theme
    { key: 'theme_primary_color', value: 'hsl(220, 65%, 28%)', group: 'theme' },
    { key: 'theme_accent_color', value: 'hsl(40, 92%, 50%)', group: 'theme' },
    // Admission
    { key: 'admission_open', value: 'true', group: 'admission' },
    { key: 'admission_year', value: '2026-2027', group: 'admission' },
    { key: 'admission_deadline', value: 'March 31, 2027', group: 'admission' },
    { key: 'admission_banner_text', value: 'Admissions Now Open for Academic Year 2026-2027!', group: 'admission' },
    // Footer
    { key: 'footer_about_text', value: 'Maa Kaushilya Convent School is a premier Co-Ed English Medium institution committed to academic excellence and holistic development of every child.', group: 'footer' },
    { key: 'footer_copyright', value: `Â© ${new Date().getFullYear()} Maa Kaushilya Convent School. All rights reserved.`, group: 'footer' },
    // SEO
    { key: 'seo_title', value: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School', group: 'seo' },
    { key: 'seo_description', value: 'MK Convent School in Sukkhipur, Jaunpur offers excellent academics, modern labs, and sports facilities. Admissions open for 2026-2027!', group: 'seo' },
    { key: 'seo_keywords', value: 'best school in jaunpur, CBSE school jaunpur, MK convent school, english medium school jaunpur', group: 'seo' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('âœ… Settings seeded')

  // â”€â”€â”€ Homepage Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  for (const section of HOMEPAGE_SECTIONS) {
    await prisma.homepageSection.upsert({
      where: { sectionId: section.id },
      update: {},
      create: {
        sectionId: section.id,
        label: section.label,
        isVisible: true,
        order: section.order,
      },
    })
  }
  console.log('âœ… Homepage sections seeded')

  // â”€â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navItems = [
    { label: 'Home', url: '/', order: 1 },
    { label: 'About Us', url: '/about', order: 2 },
    { label: 'Academics', url: '/academics', order: 3 },
    { label: 'Facilities', url: '/facilities', order: 4 },
    { label: 'Gallery', url: '/gallery', order: 5 },
    { label: 'News & Events', url: '/news', order: 6 },
    { label: 'Admissions', url: '/admissions', order: 7 },
    { label: 'Contact', url: '/contact', order: 8 },
  ]
  await prisma.navigationItem.deleteMany()
  await prisma.navigationItem.createMany({ data: navItems })
  console.log('âœ… Navigation seeded')

  // â”€â”€â”€ Hero Slides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.heroSlide.deleteMany()
  await prisma.heroSlide.createMany({
    data: [
      {
        heading: 'Where Learning Builds Character & Future',
        subheading: 'A premier Co-Ed English Medium school in Jaunpur committed to holistic education and excellence',
        badge: 'Admissions Open 2026-2027',
        primaryBtnText: 'Apply for Admission',
        primaryBtnUrl: '/admissions',
        secondaryBtnText: 'Explore School',
        secondaryBtnUrl: '/about',
        overlayIntensity: 55,
        order: 1,
        isActive: true,
      },
      {
        heading: 'Nurturing Minds, Building Tomorrow\'s Leaders',
        subheading: 'Modern infrastructure, experienced faculty, and a curriculum designed for the 21st century',
        badge: 'CBSE Pattern School',
        primaryBtnText: 'Our Academics',
        primaryBtnUrl: '/academics',
        secondaryBtnText: 'View Facilities',
        secondaryBtnUrl: '/facilities',
        overlayIntensity: 55,
        order: 2,
        isActive: true,
      },
      {
        heading: 'Every Day, Every Student, Every Dream',
        subheading: 'Uncompromising safety, inclusive community, and education that goes beyond textbooks',
        badge: 'Established by Late Kamla Devi',
        primaryBtnText: 'Enroll Your Child',
        primaryBtnUrl: '/admissions',
        secondaryBtnText: 'Watch Gallery',
        secondaryBtnUrl: '/gallery',
        overlayIntensity: 55,
        order: 3,
        isActive: true,
      },
    ],
  })
  console.log('âœ… Hero slides seeded')

  // â”€â”€â”€ About Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const aboutSections = [
    {
      key: 'about',
      heading: 'About Maa Kaushilya Convent School',
      subheading: 'A Legacy of Excellence in Education',
      content: '<p>Established with the guiding vision of our founder, <strong>Late Kamla Devi</strong>, MK Convent School is a premium Co-Ed English Medium CBSE institution. Located in Sukkhipur, Shakarmandi, Jaunpur, our autonomous, charitable, and non-profit educational institution is deeply committed to giving pupils a solid foundation in a safe and nurturing environment.</p><p>We believe in allowing every student\'s natural gifts to unfold, making learning a deeply pleasurable and interactive experience. It is our privilege to make your child\'s educational journey smooth, engaging, and rooted in strong moral values.</p>',
      order: 1,
    },
    {
      key: 'mission',
      heading: 'Our Mission',
      subheading: 'Purposeful Education for a Better Tomorrow',
      content: '<p>Our mission is to provide a world-class education that empowers students to become confident, compassionate, and globally competent individuals. We strive to create a learning environment that fosters critical thinking, creativity, and character development.</p>',
      order: 2,
    },
    {
      key: 'vision',
      heading: 'Our Vision',
      subheading: 'Excellence in Every Endeavor',
      content: '<p>To be a leading educational institution that nurtures the intellectual, emotional, physical, and moral development of every student, preparing them to contribute positively to society and thrive in a rapidly changing global landscape.</p>',
      order: 3,
    },
    {
      key: 'principal',
      heading: "Principal's Message",
      subheading: 'A Word from Our Principal',
      content: '<p>Welcome to Maa Kaushilya Convent School â€” a place where we believe every child is a unique individual with immense potential. Our dedicated team of educators works tirelessly to create an environment where curiosity is celebrated, excellence is pursued, and character is built.</p><p>We invite you to be a part of our school family, where your child will not only receive quality education but will also grow into a responsible, compassionate human being ready to make a positive difference in the world.</p>',
      order: 4,
    },
    {
      key: 'history',
      heading: 'Our History',
      subheading: 'Decades of Shaping Young Minds',
      content: '<p>Founded with a noble vision by the late Kamla Devi, MK Convent School has been serving the educational needs of families in Jaunpur and surrounding areas for many years. What started as a small institution with a big dream has grown into a respected school known for its academic standards and value-based education.</p>',
      order: 5,
    },
  ]

  for (const section of aboutSections) {
    await prisma.aboutSection.upsert({
      where: { key: section.key },
      update: {},
      create: { ...section, isVisible: true },
    })
  }
  console.log('âœ… About sections seeded')

  // â”€â”€â”€ Core Values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const coreValues = [
    { title: 'Academic Excellence', description: 'Committed to meaningful learning that caters to individual strengths and prepares students for future success.', icon: 'BookOpen', order: 1 },
    { title: 'Integrity & Truth', description: 'Propagating integrity, truth, and comprehensive growth to nurture the human spirit and moral character.', icon: 'Shield', order: 2 },
    { title: 'Holistic Development', description: 'Incorporating Physical Education, Visual Arts, and Performing Arts directly into our flexible curriculum.', icon: 'Star', order: 3 },
    { title: 'Global Readiness', description: 'Preparing students for success in a global economy while embracing diversity and contributing to society.', icon: 'Globe', order: 4 },
    { title: 'Uncompromising Safety', description: 'Ensuring an effective safety mechanism governed by our maxim: Every Dayâ€¦ Every Student.', icon: 'Heart', order: 5 },
    { title: 'Innovation', description: 'Embracing modern teaching methods and technology to make learning engaging, relevant, and effective.', icon: 'Lightbulb', order: 6 },
  ]

  await prisma.coreValue.deleteMany()
  await prisma.coreValue.createMany({ data: coreValues })
  console.log('âœ… Core values seeded')

  // â”€â”€â”€ Academics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const academics = [
    {
      title: 'Pre-Primary',
      slug: 'pre-primary',
      description: 'Our Pre-Primary program (Nursery, LKG, UKG) provides a nurturing foundation through play-based learning, developing social skills, creativity, and a love for learning in a safe, stimulating environment.',
      ageGroup: 'Ages 3-5',
      subjects: JSON.stringify(['Language & Literacy', 'Numeracy', 'Environmental Awareness', 'Arts & Crafts', 'Music & Movement', 'Physical Development']),
      highlights: JSON.stringify(['Play-based learning', 'Structured storytelling', 'Basic numeracy', 'Social skill development', 'Fun activities']),
      order: 1,
    },
    {
      title: 'Primary School',
      slug: 'primary-school',
      description: 'Classes I to V follow a comprehensive curriculum that builds strong foundational skills in literacy, numeracy, science, and social studies while encouraging curiosity and critical thinking.',
      ageGroup: 'Classes 1-5 (Ages 6-10)',
      subjects: JSON.stringify(['English', 'Hindi', 'Mathematics', 'Environmental Science', 'Computers', 'Arts', 'Physical Education']),
      highlights: JSON.stringify(['Strong English foundation', 'Interactive science experiments', 'Computer literacy', 'Sports & games', 'Value education']),
      order: 2,
    },
    {
      title: 'Middle School',
      slug: 'middle-school',
      description: 'Classes VI to VIII deepen subject knowledge with specialized teachers for each subject, preparing students for the rigors of secondary education with project-based learning and practical exposure.',
      ageGroup: 'Classes 6-8 (Ages 11-13)',
      subjects: JSON.stringify(['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computers', 'Physical Education']),
      highlights: JSON.stringify(['Subject specialization', 'Science lab experiments', 'Project-based learning', 'Public speaking', 'Leadership activities']),
      order: 3,
    },
    {
      title: 'Secondary School',
      slug: 'secondary-school',
      description: 'Classes IX and X prepare students for board examinations with focused academics, regular assessments, and career guidance sessions. Our success rate reflects our commitment to academic excellence.',
      ageGroup: 'Classes 9-10 (Ages 14-15)',
      subjects: JSON.stringify(['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer Applications', 'Physical Education']),
      highlights: JSON.stringify(['Board exam preparation', 'Regular mock tests', 'Career counseling', 'Competitive exam coaching', 'Mentorship programs']),
      order: 4,
    },
  ]

  await prisma.academic.deleteMany()
  await prisma.academic.createMany({ data: academics })
  console.log('âœ… Academics seeded')

  // â”€â”€â”€ Facilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const facilities = [
    {
      title: 'Smart Classrooms',
      slug: 'smart-classrooms',
      description: 'State-of-the-art smart classrooms equipped with digital boards, projectors, and interactive learning technology that makes education engaging and modern.',
      icon: 'Monitor',
      features: JSON.stringify(['Digital whiteboards', 'Projectors', 'Audio systems', 'Internet connected', 'Comfortable seating']),
      order: 1,
    },
    {
      title: 'Science Laboratory',
      slug: 'science-laboratory',
      description: 'A fully equipped science laboratory where students conduct hands-on experiments in Physics, Chemistry, and Biology, bringing textbook concepts to life.',
      icon: 'FlaskConical',
      features: JSON.stringify(['Physics lab equipment', 'Chemistry workstations', 'Biology microscopes', 'Safety equipment', 'Experiment materials']),
      order: 2,
    },
    {
      title: 'Computer Lab',
      slug: 'computer-lab',
      description: 'Modern computer laboratory with latest systems, high-speed internet, and educational software to prepare students for the digital age.',
      icon: 'Laptop',
      features: JSON.stringify(['Latest computers', 'High-speed internet', 'Educational software', 'Typing programs', 'Programming basics']),
      order: 3,
    },
    {
      title: 'Library & Reading Room',
      slug: 'library',
      description: 'A well-stocked library with thousands of books, magazines, newspapers, and digital resources to foster a love of reading and independent learning.',
      icon: 'BookOpen',
      features: JSON.stringify(['Thousands of books', 'Digital resources', 'Reading room', 'Reference section', 'Story books', 'Academic journals']),
      order: 4,
    },
    {
      title: 'Sports & Athletics',
      slug: 'sports',
      description: 'Extensive sports facilities including grounds for cricket, football, volleyball, and basketball, plus indoor games and yoga sessions for complete physical development.',
      icon: 'Trophy',
      features: JSON.stringify(['Cricket ground', 'Football field', 'Basketball court', 'Volleyball court', 'Indoor games', 'Yoga area']),
      order: 5,
    },
    {
      title: 'Transportation',
      slug: 'transportation',
      description: 'Safe and reliable school bus service covering major areas of Jaunpur, with trained drivers and attendants ensuring your child\'s safety every day.',
      icon: 'Bus',
      features: JSON.stringify(['GPS-tracked buses', 'Trained drivers', 'Female attendants', 'Fixed routes', 'Punctual service']),
      order: 6,
    },
    {
      title: 'Safety & Security',
      slug: 'safety-security',
      description: 'Round-the-clock CCTV surveillance, secure entry/exit points, and trained security staff to ensure a completely safe environment for all students.',
      icon: 'Shield',
      features: JSON.stringify(['24/7 CCTV', 'Secure entry/exit', 'Security guards', 'Visitor management', 'Emergency protocols']),
      order: 7,
    },
    {
      title: 'Activity Rooms',
      slug: 'activity-rooms',
      description: 'Dedicated activity rooms for music, dance, art, and other co-curricular activities that nurture talent and creativity in students.',
      icon: 'Music',
      features: JSON.stringify(['Music room', 'Dance studio', 'Art studio', 'Craft room', 'Performance space']),
      order: 8,
    },
  ]

  await prisma.facility.deleteMany()
  await prisma.facility.createMany({ data: facilities })
  console.log('âœ… Facilities seeded')

  // â”€â”€â”€ Teachers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const teachers = [
    { name: 'Mrs. Sunita Sharma', designation: 'Principal', qualification: 'M.Ed, M.A. English', department: 'Administration', bio: 'With over 20 years of experience in education, Mrs. Sharma leads MK Convent with a vision for academic excellence and holistic development.', order: 1, isFeatured: true },
    { name: 'Mr. Ramesh Gupta', designation: 'Vice Principal & Math Head', qualification: 'M.Sc Mathematics, B.Ed', department: 'Mathematics', bio: 'An expert in making mathematics engaging and accessible, with 15 years of teaching experience.', order: 2, isFeatured: true },
    { name: 'Mrs. Priya Singh', designation: 'Science Teacher', qualification: 'M.Sc Chemistry, B.Ed', department: 'Science', bio: 'Passionate about practical science education with 10 years of experience in secondary level teaching.', order: 3, isFeatured: true },
    { name: 'Mr. Ajay Kumar', designation: 'English Teacher', qualification: 'M.A. English Literature, B.Ed', department: 'English', bio: 'Dedicated to building strong communication skills and a love for literature in students.', order: 4, isFeatured: true },
    { name: 'Mrs. Kavita Verma', designation: 'Hindi Teacher', qualification: 'M.A. Hindi, B.Ed', department: 'Hindi', bio: 'Expert in Hindi language and literature, helping students connect with their cultural roots.', order: 5, isFeatured: false },
    { name: 'Mr. Vikash Yadav', designation: 'Physical Education Teacher', qualification: 'M.P.Ed', department: 'Physical Education', bio: 'Former state-level athlete who inspires students to achieve their physical best while instilling sportsmanship.', order: 6, isFeatured: false },
  ]

  await prisma.teacher.deleteMany()
  await prisma.teacher.createMany({ data: teachers.map(t => ({ ...t, isActive: true })) })
  console.log('âœ… Teachers seeded')

  // â”€â”€â”€ Achievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const achievements = [
    { title: '100% Result in Class 10', description: 'MK Convent achieved 100% pass result in Class 10 board examinations for the third consecutive year.', category: 'Academics', award: 'School Excellence Award', date: new Date('2025-06-01'), isVisible: true, order: 1 },
    { title: 'District Science Olympiad Winner', description: 'Our students secured top positions in the District Science Olympiad, showcasing exceptional scientific aptitude.', studentName: 'Team MK Convent', category: 'Academics', position: '1st Place', date: new Date('2025-09-15'), isVisible: true, order: 2 },
    { title: 'State Level Cricket Championship', description: 'MK Convent cricket team reached the state finals, demonstrating exceptional teamwork and sporting excellence.', studentName: 'Cricket Team', category: 'Sports', position: 'State Finalists', date: new Date('2025-01-20'), isVisible: true, order: 3 },
    { title: 'District Art Competition', description: 'Students won multiple prizes in the District Art Competition, reflecting the school\'s commitment to creative education.', studentName: 'Art Club Members', category: 'Arts', award: 'Multiple Prizes', date: new Date('2025-11-10'), isVisible: true, order: 4 },
    { title: 'Best School in Jaunpur Award', description: 'MK Convent was recognized as one of the best English medium schools in Jaunpur by the District Education Department.', category: 'General', award: 'Best School Award', date: new Date('2024-12-01'), isVisible: true, order: 5 },
    { title: 'Cultural Program Excellence', description: 'Outstanding performance at the State Level Inter-School Cultural Festival, winning awards in dance, music, and drama.', studentName: 'Cultural Team', category: 'Cultural', position: 'First Place', date: new Date('2025-02-14'), isVisible: true, order: 6 },
  ]

  await prisma.achievement.deleteMany()
  await prisma.achievement.createMany({ data: achievements })
  console.log('âœ… Achievements seeded')

  // â”€â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const testimonials = [
    { name: 'Rajesh Kumar Sharma', role: 'Parent', content: 'MK Convent has been a transformative experience for my daughter. The teachers are dedicated, the environment is safe, and the academic standards are excellent. My child has grown tremendously both academically and personally.', rating: 5, isVisible: true, order: 1 },
    { name: 'Priya Devi', role: 'Parent', content: 'We\'ve seen remarkable improvement in our son\'s confidence and communication skills since joining MK Convent. The school\'s holistic approach to education is exactly what we were looking for.', rating: 5, isVisible: true, order: 2 },
    { name: 'Amit Singh', role: 'Alumni', content: 'The foundation MK Convent gave me in academics and values has been invaluable. The teachers truly cared about our success, and that made all the difference in my life.', rating: 5, isVisible: true, order: 3 },
    { name: 'Sanjay Mishra', role: 'Parent', content: 'Excellent infrastructure, wonderful teachers, and a curriculum that prepares children for the real world. The sports facilities are particularly impressive, and my son loves the physical education program.', rating: 5, isVisible: true, order: 4 },
    { name: 'Meena Yadav', role: 'Parent', content: 'The school\'s emphasis on both academics and character development is commendable. My children are not just becoming good students but good human beings as well.', rating: 5, isVisible: true, order: 5 },
  ]

  await prisma.testimonial.deleteMany()
  await prisma.testimonial.createMany({ data: testimonials })
  console.log('âœ… Testimonials seeded')

  // â”€â”€â”€ Gallery Albums â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const albums = [
    { title: 'School Campus', slug: 'school-campus', description: 'Views of our beautiful school campus', category: 'Campus', order: 1, isActive: true },
    { title: 'Annual Day 2025', slug: 'annual-day-2025', description: 'Highlights from our Annual Day celebration', category: 'Events', order: 2, isActive: true },
    { title: 'Sports Day', slug: 'sports-day', description: 'Action from our Sports Day events', category: 'Sports', order: 3, isActive: true },
    { title: 'Cultural Programs', slug: 'cultural-programs', description: 'Cultural performances and celebrations', category: 'Activities', order: 4, isActive: true },
    { title: 'Science Exhibition', slug: 'science-exhibition', description: 'Student science projects and innovations', category: 'Activities', order: 5, isActive: true },
    { title: 'Classroom Life', slug: 'classroom-life', description: 'Day-to-day learning experiences', category: 'Students', order: 6, isActive: true },
  ]

  await prisma.galleryAlbum.deleteMany()
  await prisma.galleryAlbum.createMany({ data: albums })
  console.log('âœ… Gallery albums seeded')

  // â”€â”€â”€ News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.news.deleteMany()
  await prisma.news.create({
    data: {
      title: 'Admissions Open for Academic Year 2026-2027',
      slug: 'admissions-open-2026-2027',
      excerpt: 'MK Convent School is now accepting applications for all classes for the academic year 2026-2027. Limited seats available â€” enroll today!',
      content: '<p>We are pleased to announce that <strong>admissions are now open</strong> for the academic year 2026-2027 at Maa Kaushilya Convent School.</p><p>We welcome applications from Nursery through Class 10. Our school offers:</p><ul><li>CBSE Pattern English Medium education</li><li>Experienced and qualified faculty</li><li>Modern infrastructure and facilities</li><li>Holistic development through sports and co-curricular activities</li><li>Safe and nurturing environment</li></ul><p>Limited seats are available. Contact us today to secure your child\'s future.</p>',
      category: 'Admissions',
      author: 'Admin',
      status: "PUBLISHED",
      publishedAt: new Date(),
      seoTitle: 'Admissions Open 2026-2027 | MK Convent School Jaunpur',
      seoDescription: 'MK Convent School Jaunpur admissions open for 2026-2027. Apply now for Nursery to Class 10. Limited seats.',
    },
  })
  console.log('âœ… Sample news seeded')

  // â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.event.deleteMany()
  await prisma.event.createMany({
    data: [
      {
        title: 'Annual Sports Day 2026',
        slug: 'annual-sports-day-2026',
        description: 'Join us for an exciting day of sports competitions, games, and celebrations! Students from all classes will compete in various track and field events.',
        startDate: new Date('2026-11-15'),
        startTime: '8:00 AM',
        endTime: '4:00 PM',
        location: 'School Sports Ground',
        status: "PUBLISHED",
      },
      {
        title: 'Annual Cultural Festival',
        slug: 'annual-cultural-festival-2026',
        description: 'Our grand Annual Cultural Festival showcasing the talents of our students in music, dance, drama, and art. A celebration of creativity and culture.',
        startDate: new Date('2026-12-20'),
        startTime: '10:00 AM',
        endTime: '6:00 PM',
        location: 'School Auditorium',
        status: "PUBLISHED",
      },
    ],
  })
  console.log('âœ… Events seeded')

  // â”€â”€â”€ Notices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.notice.deleteMany()
  await prisma.notice.createMany({
    data: [
      {
        title: 'Admission Notification 2026-2027',
        description: 'Applications are invited for admission to all classes (Nursery to Class 10) for the academic session 2026-2027. Interested parents are requested to contact the school office between 9 AM to 2 PM on working days.',
        date: new Date(),
        isImportant: true,
        isPublished: true,
      },
      {
        title: 'Holiday Notice â€” Independence Day',
        description: 'The school will remain closed on 15th August 2026 on account of Independence Day. All students and staff are invited to the flag hoisting ceremony at 8:00 AM.',
        date: new Date('2026-08-10'),
        expiryDate: new Date('2026-08-16'),
        isImportant: false,
        isPublished: true,
      },
      {
        title: 'Fee Payment Reminder',
        description: 'Parents are requested to ensure timely payment of quarterly school fees by the 10th of the respective month to avoid late fee charges.',
        date: new Date(),
        isImportant: false,
        isPublished: true,
      },
    ],
  })
  console.log('âœ… Notices seeded')

  console.log('\nðŸŽ‰ Database seeding completed successfully!')
  console.log('\nðŸ“‹ Admin Credentials:')
  console.log('   Email: admin@mkconvent.com')
  console.log('   Password: admin@mkconvent2024')
  console.log('\nðŸŒ Run the app: npm run dev')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('âŒ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

