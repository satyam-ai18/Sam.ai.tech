'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Loader2, GraduationCap, ShieldCheck } from 'lucide-react'
import styles from './login.module.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        window.location.href = callbackUrl
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background pattern */}
      <div className={styles.bg}>
        <div className={styles.bgPattern} />
        <div className={styles.bgGradient} />
      </div>

      <div className={styles.content}>
        {/* Left Panel — Branding */}
        <div className={styles.leftPanel}>
          <div className={styles.brandingWrap}>
            <div className={styles.logoBox}>
              <GraduationCap size={40} strokeWidth={1.5} />
            </div>
            <h1 className={styles.schoolName}>Maa Kaushilya Convent School</h1>
            <p className={styles.schoolLocation}>Sukkhipur, Jaunpur, Uttar Pradesh</p>

            <div className={styles.divider} />

            <h2 className={styles.panelTitle}>Admin Control Panel</h2>
            <p className={styles.panelDesc}>
              Securely manage your school website, content, admissions, and more from one powerful dashboard.
            </p>

            <div className={styles.features}>
              {[
                'Manage all website content',
                'Handle admission applications',
                'Publish news & events',
                'Control gallery & media',
              ].map((feature) => (
                <div key={feature} className={styles.featureItem}>
                  <ShieldCheck size={16} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <div className={styles.formIcon}>
                <Lock size={22} />
              </div>
              <h2 className={styles.formTitle}>Welcome Back</h2>
              <p className={styles.formSubtitle}>Sign in to access your admin panel</p>
            </div>

            {error && (
              <div className={styles.errorAlert} role="alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label required">Email Address</label>
                <div className={styles.inputWrap}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@mkconvent.com"
                    className={`form-input ${styles.inputWithIcon}`}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label required">Password</label>
                <div className={styles.inputWrap}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`form-input ${styles.inputWithIcon} ${styles.inputWithAction}`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.showPasswordBtn}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </form>

            <div className={styles.formFooter}>
              <a href="/" className={styles.backLink}>
                ← Back to School Website
              </a>
            </div>
          </div>

          <p className={styles.copyright}>
            © {new Date().getFullYear()} Maa Kaushilya Convent School. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'hsl(220, 65%, 28%)' }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
