'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { useToast } from '@/components/admin/ui/Toast'
import { MediaPickerModal } from '@/components/admin/ui/MediaPickerModal'
import { Settings as SettingsIcon, Phone, Globe, Save, Loader2, Image as ImageIcon, Check } from 'lucide-react'

interface SettingsClientProps {
  initialSettings: Record<string, string>
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { success, error: showError } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'theme' | 'footer' | 'social'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<'site_logo' | 'site_favicon' | 'site_og_image' | null>(null)

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        group: key.startsWith('contact_')
          ? 'contact'
          : key.startsWith('social_')
          ? 'social'
          : key.startsWith('theme_')
          ? 'theme'
          : key.startsWith('footer_')
          ? 'footer'
          : 'general',
      }))

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      })

      const json = await res.json()
      if (json.success) {
        success('Website settings updated and synchronized with public portal')
      } else {
        showError(json.error?.message || 'Failed to save settings')
      }
    } catch (err) {
      showError('Network error while saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid hsl(220, 20%, 88%)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'general' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'general' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <SettingsIcon size={16} />
          General Identity & Brand
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'contact' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'contact' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Phone size={16} />
          Contact Channels
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'theme' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'theme' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <SettingsIcon size={16} />
          Theme & Appearance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('footer')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'footer' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'footer' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Globe size={16} />
          Footer Builder
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'social' ? '2.5px solid hsl(220, 70%, 35%)' : '2.5px solid transparent',
            background: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: activeTab === 'social' ? 'hsl(220, 70%, 35%)' : 'hsl(220, 15%, 50%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Globe size={16} />
          Social Media Links
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* General Identity Tab */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>School General Identity</CardTitle>
                <CardDescription>Official institution name, branding tagline, and graphic assets</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.site_name || ''}
                    onChange={(e) => handleChange('site_name', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.site_short_name || ''}
                    onChange={(e) => handleChange('site_short_name', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={settings.site_tagline || ''}
                    onChange={(e) => handleChange('site_tagline', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    School Logo
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="/uploads/logo.png"
                      value={settings.site_logo || ''}
                      onChange={(e) => handleChange('site_logo', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('site_logo')}
                      style={{ height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <ImageIcon size={15} /> Select
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Favicon
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="/favicon.ico"
                      value={settings.site_favicon || ''}
                      onChange={(e) => handleChange('site_favicon', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('site_favicon')}
                      style={{ height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <ImageIcon size={15} /> Select
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Default Social Share Image (OG Image)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="/uploads/campus-share.jpg"
                      value={settings.site_og_image || ''}
                      onChange={(e) => handleChange('site_og_image', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget('site_og_image')}
                      style={{ height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 80%)', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <ImageIcon size={15} /> Select
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Channels Tab */}
        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Primary communication channels published on header, footer, and contact page</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Primary Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Alternate Phone
                  </label>
                  <input
                    type="text"
                    value={settings.contact_phone_2 || ''}
                    onChange={(e) => handleChange('contact_phone_2', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={settings.contact_whatsapp || ''}
                    onChange={(e) => handleChange('contact_whatsapp', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Office Visiting Hours
                  </label>
                  <input
                    type="text"
                    value={settings.contact_office_hours || ''}
                    onChange={(e) => handleChange('contact_office_hours', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Campus Physical Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={settings.contact_address || ''}
                    onChange={(e) => handleChange('contact_address', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.9375rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    value={settings.contact_map_embed || ''}
                    onChange={(e) => handleChange('contact_map_embed', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Theme & Appearance Tab */}
        {activeTab === 'theme' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Global Theme & Styling System</CardTitle>
                <CardDescription>
                  Configure institution design system tokens without breaking layout integrity
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Primary Brand Color
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.theme_primary_color || '#162b60'}
                      onChange={(e) => handleChange('theme_primary_color', e.target.value)}
                      style={{ width: '42px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder="#162b60"
                      value={settings.theme_primary_color || '#162b60'}
                      onChange={(e) => handleChange('theme_primary_color', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>Default: #162b60 (Deep Navy Trust)</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Accent Highlight Color
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.theme_accent_color || '#f59e0b'}
                      onChange={(e) => handleChange('theme_accent_color', e.target.value)}
                      style={{ width: '42px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder="#f59e0b"
                      value={settings.theme_accent_color || '#f59e0b'}
                      onChange={(e) => handleChange('theme_accent_color', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>Default: #f59e0b (Academic Gold)</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Secondary Palette
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings.theme_secondary_color || '#237a57'}
                      onChange={(e) => handleChange('theme_secondary_color', e.target.value)}
                      style={{ width: '42px', height: '42px', padding: '2px', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder="#237a57"
                      value={settings.theme_secondary_color || '#237a57'}
                      onChange={(e) => handleChange('theme_secondary_color', e.target.value)}
                      style={{ flex: 1, height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 55%)' }}>Default: #237a57 (Forest Academic Growth)</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Button Styling
                  </label>
                  <select
                    value={settings.theme_button_style || 'rounded'}
                    onChange={(e) => handleChange('theme_button_style', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="rounded">Modern Rounded (8px radius)</option>
                    <option value="pill">Soft Pill Style (9999px radius)</option>
                    <option value="compact">Classic Compact (4px radius)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Container Border Radius Style
                  </label>
                  <select
                    value={settings.theme_border_radius || '12px'}
                    onChange={(e) => handleChange('theme_border_radius', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="8px">Compact (8px)</option>
                    <option value="12px">Modern (12px standard)</option>
                    <option value="16px">Soft Elevated (16px)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Builder Tab */}
        {activeTab === 'footer' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Footer Builder & Links</CardTitle>
                <CardDescription>Manage copyright notices, school description, and column visibility in the public footer</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Footer Description / About Text
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A premier Co-Ed English Medium institution..."
                    value={settings.footer_about_text || ''}
                    onChange={(e) => handleChange('footer_about_text', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    placeholder="© 2026 Maa Kaushilya Convent School. All rights reserved."
                    value={settings.footer_copyright || ''}
                    onChange={(e) => handleChange('footer_copyright', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Quick Links Column Visibility
                  </label>
                  <select
                    value={settings.footer_show_quick_links !== 'false' ? 'true' : 'false'}
                    onChange={(e) => handleChange('footer_show_quick_links', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="true">Visible in Footer</option>
                    <option value="false">Hidden from Footer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Important Links Column Visibility
                  </label>
                  <select
                    value={settings.footer_show_important_links !== 'false' ? 'true' : 'false'}
                    onChange={(e) => handleChange('footer_show_important_links', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem', background: '#ffffff' }}
                  >
                    <option value="true">Visible in Footer</option>
                    <option value="false">Hidden from Footer</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media Links Tab */}
        {activeTab === 'social' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Social Media Profiles</CardTitle>
                <CardDescription>Social links will only appear publicly if a URL is provided</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={settings.social_facebook || ''}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={settings.social_youtube || ''}
                    onChange={(e) => handleChange('social_youtube', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={settings.social_instagram || ''}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    X (Twitter) Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/..."
                    value={settings.social_twitter || ''}
                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    LinkedIn Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/..."
                    value={settings.social_linkedin || ''}
                    onChange={(e) => handleChange('social_linkedin', e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 0.875rem', borderRadius: '8px', border: '1px solid hsl(220, 20%, 85%)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'hsl(220, 70%, 35%)',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setPickerTarget(null)}
          onSelect={(media) => {
            handleChange(pickerTarget, media.url)
            setPickerTarget(null)
          }}
          title={
            pickerTarget === 'site_logo'
              ? 'Select School Logo'
              : pickerTarget === 'site_favicon'
              ? 'Select Favicon Icon'
              : 'Select Default Social Share Image'
          }
        />
      )}
    </div>
  )
}
