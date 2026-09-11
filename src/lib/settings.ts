// Centralized Settings System
// MK Convent School CMS

import { prisma } from '@/lib/db'

export interface SiteSettings {
  // General
  site_name: string
  site_short_name: string
  site_tagline: string
  site_description: string
  site_logo: string
  site_favicon: string

  // Contact
  contact_phone: string
  contact_phone_2: string
  contact_email: string
  contact_address: string
  contact_office_hours: string
  contact_whatsapp: string
  contact_map_embed: string

  // Social
  social_facebook: string
  social_youtube: string
  social_instagram: string
  social_twitter: string

  // Website & Operations
  maintenance_mode: string
  admission_open: string
  admission_year: string
  admission_deadline: string
  admission_banner_text: string

  // Theme & Appearance
  theme_primary_color: string
  theme_accent_color: string

  // SEO Defaults
  seo_title: string
  seo_description: string
  seo_keywords: string
}

export const DEFAULT_SETTINGS: Partial<SiteSettings> = {
  site_name: 'Maa Kaushilya Convent School',
  site_short_name: 'MK Convent',
  site_tagline: 'Where Learning Builds Character & Future',
  site_description: 'MK Convent School is a premier Co-Ed English Medium CBSE pattern institution in Jaunpur, UP.',
  contact_phone: '8858514567',
  contact_email: 'mkconventschool@gmail.com',
  contact_address: 'Sukkhipur, Shakarmandi, Post Sadar, Jaunpur, Uttar Pradesh - 222001',
  contact_office_hours: 'Monday - Saturday: 8:00 AM - 4:00 PM',
  contact_whatsapp: '8858514567',
  social_facebook: 'https://www.facebook.com/Mk-Convent-School-107325068627370/',
  social_youtube: 'https://www.youtube.com/channel/UCCuvXs6Ob7GvpEIPYJkz4zA',
  social_instagram: '',
  social_twitter: '',
  maintenance_mode: 'false',
  admission_open: 'true',
  admission_year: '2026-2027',
  theme_primary_color: 'hsl(220, 65%, 28%)',
  theme_accent_color: 'hsl(40, 92%, 50%)',
  seo_title: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School',
  seo_description: 'MK Convent School in Jaunpur provides top quality education from Nursery to Class 10.',
  seo_keywords: 'school in jaunpur, MK convent school, CBSE school jaunpur',
}

/**
 * Fetch all settings as a flat key-value dictionary
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany()
    const result: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const r of rows) {
      result[r.key] = r.value
    }
    return result
  } catch (error) {
    console.error('Failed to load settings from DB, using defaults:', error)
    return { ...DEFAULT_SETTINGS } as Record<string, string>
  }
}

/**
 * Fetch settings filtered by group (e.g. general, contact, social, website, seo)
 */
export async function getSettingsByGroup(group: string): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany({ where: { group } })
    const result: Record<string, string> = {}
    for (const r of rows) {
      result[r.key] = r.value
    }
    return result
  } catch (error) {
    console.error(`Failed to load settings for group ${group}:`, error)
    return {}
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } })
    return row ? row.value : (DEFAULT_SETTINGS as any)[key] || defaultValue
  } catch (error) {
    return (DEFAULT_SETTINGS as any)[key] || defaultValue
  }
}

/**
 * Update or create a single setting
 */
export async function setSetting(
  key: string,
  value: string,
  group = 'general',
  type = 'text'
) {
  return await prisma.setting.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: { key, value, group, type },
  })
}

/**
 * Update multiple settings in a transaction
 */
export async function setSettingsBatch(
  entries: { key: string; value: string; group?: string; type?: string }[]
) {
  return await prisma.$transaction(
    entries.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, updatedAt: new Date() },
        create: {
          key: item.key,
          value: item.value,
          group: item.group || 'general',
          type: item.type || 'text',
        },
      })
    )
  )
}
