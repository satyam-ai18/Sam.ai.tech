import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Twitter, GraduationCap, ExternalLink } from 'lucide-react'
import styles from './Footer.module.css'

interface FooterProps {
  settings: Record<string, string>
}

export function Footer({ settings }: FooterProps) {
  const schoolName = settings.site_name || 'Maa Kaushilya Convent School'
  const aboutText = settings.footer_about_text || 'A premier Co-Ed English Medium institution committed to academic excellence and holistic development of every child.'
  const phone = settings.contact_phone || '8858514567'
  const email = settings.contact_email || 'mkconventschool@gmail.com'
  const address = settings.contact_address || 'Sukkhipur, Shakarmandi, Post Sadar, Jaunpur, Uttar Pradesh'
  const copyright = settings.footer_copyright || `© ${new Date().getFullYear()} Maa Kaushilya Convent School. All rights reserved.`
  const facebook = settings.social_facebook
  const youtube = settings.social_youtube
  const instagram = settings.social_instagram
  const whatsapp = settings.contact_whatsapp

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Academics', href: '/academics' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Our Staff', href: '/staff' },
    { label: 'Achievements', href: '/achievements' },
  ]

  const importantLinks = [
    { label: 'Online Admission', href: '/admissions' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'News & Events', href: '/news' },
    { label: 'Notice Board', href: '/notices' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Submit Complaint', href: '/complaint' },
  ]

  return (
    <footer className={styles.footer} id="site-footer">
      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>Admissions Open for 2026-2027!</h2>
              <p className={styles.ctaDesc}>Secure your child's future at MK Convent — limited seats available.</p>
            </div>
            <div className={styles.ctaBtns}>
              <Link href="/admissions" className="btn btn-accent btn-lg" id="footer-admission-btn">
                Apply Now
              </Link>
              {whatsapp && (
                <a href={`https://wa.me/91${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* About */}
            <div className={styles.col}>
              <div className={styles.brand}>
                <div className={styles.brandIcon}>
                  <GraduationCap size={24} strokeWidth={1.5} />
                </div>
                <span className={styles.brandName}>{schoolName}</span>
              </div>
              <p className={styles.aboutText}>{aboutText}</p>
              <div className={styles.socialLinks}>
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
                    <Facebook size={16} />
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="YouTube">
                    <Youtube size={16} />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Quick Links</h3>
              <ul className={styles.linkList}>
                {quickLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.footerLink}>
                      <span>→</span> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Links */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Important</h3>
              <ul className={styles.linkList}>
                {importantLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.footerLink}>
                      <span>→</span> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Contact Us</h3>
              <div className={styles.contactList}>
                {phone && (
                  <a href={`tel:${phone}`} className={styles.contactItem}>
                    <div className={styles.contactIcon}><Phone size={16} /></div>
                    <div>
                      <div className={styles.contactLabel}>Call Us</div>
                      <div className={styles.contactValue}>{phone}</div>
                    </div>
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className={styles.contactItem}>
                    <div className={styles.contactIcon}><Mail size={16} /></div>
                    <div>
                      <div className={styles.contactLabel}>Email Us</div>
                      <div className={styles.contactValue}>{email}</div>
                    </div>
                  </a>
                )}
                {address && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}><MapPin size={16} /></div>
                    <div>
                      <div className={styles.contactLabel}>Address</div>
                      <div className={styles.contactValue}>{address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className="container">
          <div className={styles.copyrightInner}>
            <p className={styles.copyrightText}>{copyright}</p>
            <div className={styles.legalLinks}>
              <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <span>·</span>
              <Link href="/terms" className={styles.legalLink}>Terms of Use</Link>
              <span>·</span>
              <a href="/admin/dashboard" className={styles.legalLink}>Admin</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
