export const SCHOOL_INFO = {
  name: 'Maa Kaushilya Convent School',
  shortName: 'MK Convent',
  tagline: 'Where Learning Builds Character & Future',
  phone: '8858514567',
  email: 'mkconventschool@gmail.com',
  address: 'Sukkhipur, Shakarmandi, Post Sadar, Jaunpur',
  city: 'Jaunpur',
  state: 'Uttar Pradesh',
  pincode: '222001',
  country: 'India',
  board: 'CBSE Pattern',
  type: 'Co-Ed English Medium',
  founded: '2010',
  founder: 'Late Kamla Devi',
  facebook: 'https://www.facebook.com/Mk-Convent-School-107325068627370/',
  youtube: 'https://www.youtube.com/channel/UCCuvXs6Ob7GvpEIPYJkz4zA',
  whatsapp: '8858514567',
} as const

export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_ADMIN: 'Content Admin',
  ADMISSION_ADMIN: 'Admission Admin',
  EDITOR: 'Editor',
} as const

export const ADMISSION_STATUSES = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const

export const COMPLAINT_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const

export const CONTENT_STATUSES = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
} as const

export const GALLERY_CATEGORIES = [
  'Campus',
  'Events',
  'Sports',
  'Activities',
  'Celebrations',
  'Students',
  'Other',
] as const

export const ACHIEVEMENT_CATEGORIES = [
  'Academics',
  'Sports',
  'Cultural',
  'Science',
  'Arts',
  'General',
] as const

export const CLASS_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
] as const

export const COMPLAINT_CATEGORIES = [
  'Academic',
  'Infrastructure',
  'Transport',
  'Fee',
  'Staff',
  'Safety',
  'General',
] as const

export const HOMEPAGE_SECTIONS = [
  { id: 'announcement', label: 'Announcement Bar (Ticker)', order: 0 },
  { id: 'hero', label: 'Hero Slider', order: 1 },
  { id: 'admission_banner', label: 'Admission Banner', order: 2 },
  { id: 'notice_board', label: 'Notice Board', order: 3 },
  { id: 'quick_info', label: 'Quick Information', order: 4 },
  { id: 'about', label: 'About School', order: 5 },
  { id: 'why_us', label: 'Why Choose Us', order: 6 },
  { id: 'principal', label: "Principal's Message", order: 7 },
  { id: 'academics', label: 'Academics', order: 8 },
  { id: 'facilities', label: 'Facilities', order: 9 },
  { id: 'campus_life', label: 'Campus Life', order: 10 },
  { id: 'achievements', label: 'Achievements', order: 11 },
  { id: 'teachers', label: 'Teachers & Faculty', order: 12 },
  { id: 'gallery', label: 'Gallery Preview', order: 13 },
  { id: 'stats', label: 'School At a Glance', order: 14 },
  { id: 'news', label: 'Latest News', order: 15 },
  { id: 'events', label: 'Upcoming Events', order: 16 },
  { id: 'testimonials', label: 'Testimonials', order: 17 },
  { id: 'admission_process', label: 'Admission Process', order: 18 },
  { id: 'contact_cta', label: 'Contact CTA', order: 19 },
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_DOC_TYPES = ['application/pdf']
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]
