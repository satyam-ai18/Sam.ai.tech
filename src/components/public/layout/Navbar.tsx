'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, ChevronDown, GraduationCap, MapPin } from 'lucide-react'
import Image from 'next/image'
import styles from './Navbar.module.css'

interface NavItem {
  id: string
  label: string
  url: string
  target: string
  children?: NavItem[]
}

interface NavbarProps {
  settings: Record<string, string>
  navItems: NavItem[]
}

export function Navbar({ settings, navItems }: NavbarProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (url: string) =>
    url === '/' ? pathname === '/' : pathname.startsWith(url)

  const schoolName = settings.site_name || 'Maa Kaushilya Convent School'
  const logo = settings.site_logo
  const tagline = settings.site_tagline || 'CBSE Pattern · Co-Ed · English Medium'
  const phone = settings.contact_phone || '8858514567'
  const email = settings.contact_email || ''
  const facebook = settings.social_facebook || ''
  const youtube = settings.social_youtube || ''
  const instagram = settings.social_instagram || ''

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`} id="site-header">
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <span className={styles.topBarItem}>
                <MapPin size={13} />
                <span>Sukkhipur, Jaunpur</span>
              </span>
              {phone && (
                <a href={`tel:${phone}`} className={styles.topBarItem}>
                  <Phone size={13} />
                  <span>{phone}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className={styles.topBarItem}>
                  <Mail size={13} />
                  <span>{email}</span>
                </a>
              )}
            </div>
            <div className={styles.topBarRight}>
              {(facebook || youtube || instagram) && (
                <span className={styles.topBarText}>Follow Us:</span>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                  <Facebook size={14} />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                  <Youtube size={14} />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                  <Instagram size={14} />
                </a>
              )}
              <Link href="/auth/login" className={styles.adminLink}>Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        <div className="container">
          <div className={styles.navInner}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                {logo ? (
                  <Image src={logo} alt={schoolName} width={32} height={32} style={{ objectFit: 'contain' }} />
                ) : (
                  <GraduationCap size={28} strokeWidth={1.5} />
                )}
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>{schoolName}</span>
                <span className={styles.logoTagline}>{tagline}</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className={styles.desktopNav} ref={dropdownRef}>
              {navItems.map(item => (
                <div key={item.id} className={styles.navItemWrap}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <button
                        className={`${styles.navLink} ${isActive(item.url) ? styles.active : ''}`}
                        onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                        aria-expanded={activeDropdown === item.id}
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === item.id ? styles.chevronUp : ''}`} />
                      </button>
                      {activeDropdown === item.id && (
                        <div className={styles.dropdown} role="menu">
                          {item.children.map(child => (
                            <Link
                              key={child.id}
                              href={child.url}
                              target={child.target}
                              className={`${styles.dropdownItem} ${isActive(child.url) ? styles.active : ''}`}
                              role="menuitem"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      target={item.target}
                      className={`${styles.navLink} ${isActive(item.url) ? styles.active : ''}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <Link href="/admissions" className="btn btn-accent btn-sm" id="admission-cta-btn">
                Apply Now
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu} id="mobile-menu">
          <div className="container">
            <div className={styles.mobileLinks}>
              {navItems.map(item => (
                <div key={item.id}>
                  <Link
                    href={item.url}
                    className={`${styles.mobileLink} ${isActive(item.url) ? styles.active : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children?.map(child => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className={`${styles.mobileLink} ${styles.mobileSubLink} ${isActive(child.url) ? styles.active : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link href="/admissions" className="btn btn-accent" id="mobile-admission-btn" onClick={() => setMobileOpen(false)}>
                Apply for Admission
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
