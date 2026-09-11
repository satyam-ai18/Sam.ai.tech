import { z } from 'zod'

// ─── Auth ────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// ─── Admission ───────────────────────────────
export const admissionSchema = z.object({
  // Student
  studentFirstName: z.string().min(2, 'First name is required').max(50),
  studentLastName: z.string().min(2, 'Last name is required').max(50),
  studentGender: z.enum(['Male', 'Female', 'Other']),
  studentDob: z.string().min(1, 'Date of birth is required'),
  classApplied: z.string().min(1, 'Class is required'),

  // Contact
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  alternatePhone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),

  // Father
  fatherName: z.string().min(2, "Father's name is required"),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherEmail: z.string().email().optional().or(z.literal('')),

  // Mother
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),

  // Previous School
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousBoard: z.string().optional(),
  previousPercentage: z.string().optional(),
})

export type AdmissionFormData = z.infer<typeof admissionSchema>

// ─── Complaint ───────────────────────────────
export const complaintSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
})

export type ComplaintFormData = z.infer<typeof complaintSchema>

// ─── Contact ─────────────────────────────────
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject required').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

// ─── Teacher ─────────────────────────────────
export const teacherSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  designation: z.string().min(2, 'Designation is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  department: z.string().min(2, 'Department is required'),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

// ─── News ────────────────────────────────────
export const newsSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10, 'Content is required'),
  category: z.string().default('general'),
  author: z.string().default('Admin'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
})

// ─── Event ───────────────────────────────────
export const eventSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  registrationUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

// ─── Notice ──────────────────────────────────
export const noticeSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().optional(),
  isImportant: z.boolean().default(false),
  isPublished: z.boolean().default(false),
})

// ─── Academic ────────────────────────────────
export const academicSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  ageGroup: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

// ─── Facility ────────────────────────────────
export const facilitySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  icon: z.string().optional(),
  features: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

// ─── Achievement ─────────────────────────────
export const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  studentName: z.string().optional(),
  category: z.string().default('general'),
  award: z.string().optional(),
  position: z.string().optional(),
  date: z.string().optional(),
  isVisible: z.boolean().default(true),
  order: z.number().int().default(0),
})

// ─── Testimonial ─────────────────────────────
export const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().default('Parent'),
  content: z.string().min(20, 'Testimonial must be at least 20 characters'),
  rating: z.number().int().min(1).max(5).default(5),
  isVisible: z.boolean().default(true),
  order: z.number().int().default(0),
})

// ─── User ────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'ADMISSION_ADMIN', 'EDITOR']),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional().or(z.literal('')),
})

// ─── Gallery ─────────────────────────────────
export const galleryAlbumSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  category: z.string().default('general'),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})
