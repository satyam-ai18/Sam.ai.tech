import { prisma } from '@/lib/db'
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs'
import { TestimonialsClient } from './TestimonialsClient'

export const dynamic = 'force-dynamic'

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Website', href: '/admin/website' }, { label: 'Testimonials' }]} />
      <TestimonialsClient initialTestimonials={testimonials as any} />
    </div>
  )
}
