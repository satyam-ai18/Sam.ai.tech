import { Metadata } from 'next'
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/Typography'
import { Section } from '@/components/ui/Section'
import { StatusClient } from './StatusClient'
import { SCHOOL_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Check Application Status | ${SCHOOL_INFO.name}`,
  description: `Track your admission application progress with your official reference number at ${SCHOOL_INFO.name}.`,
}

export const dynamic = 'force-dynamic'

export default function AdmissionStatusPage() {
  return (
    <main>
      <PageHeader
        badge="Application Tracker"
        title="Check Admission Status"
        description="Enter your application reference number to check review, verification, and admission approval status in real time."
      />

      <Section>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading Tracker...</div>}>
          <StatusClient />
        </Suspense>
      </Section>
    </main>
  )
}
