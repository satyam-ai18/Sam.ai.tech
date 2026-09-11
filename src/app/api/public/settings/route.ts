import { getAllSettings } from '@/lib/settings'
import { successResponse, handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    const all = await getAllSettings()
    // Return only safe public settings (never leak internal configs)
    const publicSettings = {
      site_name: all.site_name,
      site_short_name: all.site_short_name,
      site_tagline: all.site_tagline,
      site_description: all.site_description,
      site_logo: all.site_logo,
      site_favicon: all.site_favicon,
      contact_phone: all.contact_phone,
      contact_phone_2: all.contact_phone_2,
      contact_email: all.contact_email,
      contact_address: all.contact_address,
      contact_office_hours: all.contact_office_hours,
      contact_whatsapp: all.contact_whatsapp,
      contact_map_embed: all.contact_map_embed,
      social_facebook: all.social_facebook,
      social_youtube: all.social_youtube,
      social_instagram: all.social_instagram,
      social_twitter: all.social_twitter,
      admission_open: all.admission_open,
      admission_year: all.admission_year,
      admission_deadline: all.admission_deadline,
      admission_banner_text: all.admission_banner_text,
      theme_primary_color: all.theme_primary_color,
      theme_accent_color: all.theme_accent_color,
      seo_title: all.seo_title,
      seo_description: all.seo_description,
    }
    return successResponse(publicSettings)
  } catch (error) {
    return handleApiError(error)
  }
}
