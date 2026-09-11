'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { PublicCard } from '@/components/ui/Card'
import { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'
import { COMPLAINT_CATEGORIES } from '@/lib/constants'
import { MessageSquare, CheckCircle2, Send } from 'lucide-react'

export default function ComplaintPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      <PageHeader
        badge="Feedback & Support"
        title="Grievance / Feedback Portal"
        description="We value transparency, safety, and open communication. Share your suggestions or complaints directly with school administration."
      />

      <Section>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {submitted ? (
            <PublicCard style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'hsl(140, 60%, 93%)',
                  color: 'hsl(140, 70%, 35%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                Thank You for Your Feedback
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Your feedback has been routed to our administrative desk. We treat all concerns with utmost seriousness and confidentiality.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Submit Another Feedback
              </Button>
            </PublicCard>
          ) : (
            <PublicCard style={{ padding: '2.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormGroup>
                    <FormLabel required>Your Name</FormLabel>
                    <FormInput placeholder="Parent / Student / Guardian Name" required />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel required>Contact Email</FormLabel>
                    <FormInput type="email" placeholder="name@example.com" required />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormGroup>
                    <FormLabel>Phone Number</FormLabel>
                    <FormInput type="tel" placeholder="Mobile Number" />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel required>Category</FormLabel>
                    <FormSelect required defaultValue="">
                      <option value="" disabled>Select Category</option>
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </div>

                <FormGroup>
                  <FormLabel required>Subject</FormLabel>
                  <FormInput placeholder="Brief title of your concern" required />
                </FormGroup>

                <FormGroup>
                  <FormLabel required>Detailed Message</FormLabel>
                  <FormTextarea placeholder="Please describe the issue or feedback in detail..." required rows={5} />
                </FormGroup>

                <div style={{ marginTop: '2rem' }}>
                  <Button variant="primary" fullWidth size="lg" icon={<Send size={18} />} iconPosition="right">
                    Submit Grievance
                  </Button>
                </div>
              </form>
            </PublicCard>
          )}
        </div>
      </Section>
    </main>
  )
}
