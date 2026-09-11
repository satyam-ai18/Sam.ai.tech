import { Metadata } from 'next'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { getAllSettings } from '@/lib/settings'
import { SCHOOL_INFO } from '@/lib/constants'
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = {
  title: `Contact Us | ${SCHOOL_INFO.name}`,
  description: `Get in touch with ${SCHOOL_INFO.name} located at Sukkhipur, Shakarmandi, Jaunpur. Phone: ${SCHOOL_INFO.phone}.`,
}

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const settings = await getAllSettings()

  return (
    <main>
      <PageHeader
        badge="Reach Out"
        title="Get In Touch With Us"
        description="We are here to answer all your admission inquiries, schedule campus visits, and assist your family."
      />

      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Details Cards */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1.5rem' }}>
              Campus Contact Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <PublicCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>School Address</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {settings.contact_address || SCHOOL_INFO.address}
                  </p>
                </div>
              </PublicCard>

              <PublicCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'hsl(140, 60%, 93%)', color: 'hsl(140, 70%, 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Call Administration</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    <a href={`tel:${settings.contact_phone || SCHOOL_INFO.phone}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      +91 {settings.contact_phone || SCHOOL_INFO.phone}
                    </a>
                    {settings.contact_phone_2 && (
                      <> / <a href={`tel:${settings.contact_phone_2}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>+91 {settings.contact_phone_2}</a></>
                    )}
                  </p>
                </div>
              </PublicCard>

              <PublicCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'hsl(210, 80%, 94%)', color: 'hsl(210, 80%, 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Email Us</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    <a href={`mailto:${settings.contact_email || SCHOOL_INFO.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {settings.contact_email || SCHOOL_INFO.email}
                    </a>
                  </p>
                </div>
              </PublicCard>

              <PublicCard style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'hsl(40, 95%, 92%)', color: 'hsl(40, 95%, 35%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Office Visiting Hours</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {settings.contact_office_hours || 'Monday – Saturday: 8:00 AM – 4:00 PM'}
                  </p>
                </div>
              </PublicCard>
            </div>
          </div>

          {/* Inquiry Message Form */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1.5rem' }}>
              Send an Official Inquiry
            </h2>

            <ContactClient />
          </div>
        </div>
      </Section>
    </main>
  )
}
