import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School',
    template: '%s | MK Convent School',
  },
  description: 'MK Convent School in Sukkhipur, Jaunpur offers excellent academics, modern labs, and sports facilities. Admissions open for 2026-2027!',
  keywords: ['best school in jaunpur', 'CBSE school jaunpur', 'MK convent school', 'english medium school jaunpur', 'maa kaushilya convent school'],
  authors: [{ name: 'MK Convent School' }],
  creator: 'MK Convent School',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mkconvent.com',
    siteName: 'Maa Kaushilya Convent School',
    title: 'Best CBSE School in Jaunpur | Maa Kaushilya Convent School',
    description: 'MK Convent School offers excellent academics, modern infrastructure, and holistic education in Jaunpur, Uttar Pradesh.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
