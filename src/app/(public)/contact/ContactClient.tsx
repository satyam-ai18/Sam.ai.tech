'use client'

import React, { useState } from 'react'
import { PublicCard } from '@/components/ui/Card'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (json.success) {
        setSuccessMessage(
          json.data?.message ||
            'Thank you for contacting us! We have received your inquiry and our team will get back to you promptly.'
        )
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
      } else {
        setErrorMessage(json.error?.message || 'Failed to send message. Please try again.')
      }
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicCard style={{ padding: '2rem' }}>
      {successMessage ? (
        <div
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'hsl(140, 60%, 92%)',
              color: 'hsl(140, 70%, 30%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'hsl(220, 35%, 15%)',
              margin: '0 0 0.5rem 0',
            }}
          >
            Message Sent Successfully!
          </h3>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'hsl(220, 15%, 45%)',
              lineHeight: 1.6,
              margin: '0 0 1.5rem 0',
              maxWidth: '420px',
            }}
          >
            {successMessage}
          </p>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid hsl(220, 20%, 85%)',
              background: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Send Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                background: 'hsl(0, 80%, 96%)',
                color: 'hsl(0, 70%, 45%)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Chandra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid hsl(220, 20%, 85%)',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid hsl(220, 20%, 85%)',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Subject / Topic *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Admission inquiry for Class 6"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid hsl(220, 20%, 85%)',
                  fontSize: '0.9375rem',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Your Message / Inquiry *
              </label>
              <textarea
                rows={4}
                required
                placeholder="How can our school administration assist your family?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid hsl(220, 20%, 85%)',
                  fontSize: '0.9375rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                border: 'none',
                background: 'hsl(220, 65%, 28%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                transition: 'background 0.15s ease',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <span>Send Inquiry</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </PublicCard>
  )
}
