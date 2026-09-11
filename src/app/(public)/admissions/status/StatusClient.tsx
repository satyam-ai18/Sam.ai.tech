'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicCard } from '@/components/ui/Card'
import {
  Search, CheckCircle2, Clock, AlertCircle, Loader2, FileCheck,
  User, GraduationCap, Calendar, XCircle, MessageSquare, History,
} from 'lucide-react'

interface StatusHistoryEntry {
  fromStatus: string | null
  toStatus: string
  notes: string | null
  date: string
}

interface StatusResult {
  referenceNumber: string
  applicantName: string
  classApplied: string
  session: string | null
  status: string
  adminMessage: string | null
  submissionDate: string
  lastUpdated: string
  statusHistory: StatusHistoryEntry[]
}

export function StatusClient() {
  const searchParams = useSearchParams()
  const [refInput, setRefInput] = useState('')
  const [dobInput, setDobInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StatusResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchStatus = async (code: string, dob?: string) => {
    if (!code.trim()) return
    setIsLoading(true)
    setErrorMessage('')
    setResult(null)

    try {
      let url = `/api/public/admissions/status?ref=${encodeURIComponent(code.trim())}`
      if (dob) url += `&dob=${encodeURIComponent(dob)}`
      const res = await fetch(url)
      const json = await res.json()

      if (json.success && json.data) {
        setResult(json.data)
      } else {
        setErrorMessage(json.error?.message || 'No application record found matching this reference number.')
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const urlRef = searchParams.get('ref')
    if (urlRef) {
      setRefInput(urlRef)
      fetchStatus(urlRef)
    }
  }, [searchParams])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    fetchStatus(refInput, dobInput || undefined)
  }

  const getStatusStepIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUBMITTED': return 1
      case 'UNDER_REVIEW': return 2
      case 'VERIFIED': return 3
      case 'APPROVED': return 4
      case 'REJECTED': return -1
      default: return 1
    }
  }

  const stepIndex = result ? getStatusStepIndex(result.status) : 0
  const isRejected = result?.status === 'REJECTED'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <PublicCard style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch}>
          <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 700, color: 'hsl(220, 35%, 15%)', marginBottom: '0.625rem' }}>
            Enter Application Reference Number *
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              id="status-ref-input"
              type="text"
              required
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. MK-2026-1042"
              style={{
                flex: 1, minWidth: '220px', height: '46px', padding: '0 1rem',
                borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)',
                fontSize: '1rem', fontFamily: 'monospace', textTransform: 'uppercase',
              }}
            />
            <button
              id="status-track-btn"
              type="submit"
              disabled={isLoading}
              style={{
                height: '46px', padding: '0 1.5rem', borderRadius: '8px', border: 'none',
                background: 'hsl(220, 65%, 28%)', color: '#ffffff', fontWeight: 700,
                fontSize: '0.9375rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
              <span>Track Status</span>
            </button>
          </div>

          {/* Optional DOB verification */}
          <div style={{ marginTop: '0.875rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(220, 15%, 50%)', marginBottom: '0.375rem' }}>
              Date of Birth (optional — for additional verification)
            </label>
            <input
              type="date"
              value={dobInput}
              onChange={(e) => setDobInput(e.target.value)}
              style={{
                width: '200px', height: '38px', padding: '0 0.75rem',
                borderRadius: '8px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.875rem',
              }}
            />
          </div>

          <span style={{ display: 'block', fontSize: '0.8125rem', color: 'hsl(220, 15%, 55%)', marginTop: '0.5rem' }}>
            You received this reference code when you completed your online application.
          </span>
        </form>
      </PublicCard>

      {/* Error State */}
      {errorMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem',
          borderRadius: '10px', background: 'hsl(0, 80%, 96%)', border: '1px solid hsl(0, 70%, 88%)',
          color: 'hsl(0, 70%, 40%)', fontSize: '0.9375rem', marginBottom: '2rem',
        }}>
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Found Result */}
      {result && (
        <PublicCard style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid hsl(220, 20%, 92%)', paddingBottom: '1.25rem',
            marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(220, 15%, 50%)', letterSpacing: '0.05em' }}>
                Official Reference
              </span>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: 'hsl(220, 35%, 15%)', fontFamily: 'monospace' }}>
                {result.referenceNumber}
              </h3>
            </div>
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.875rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8125rem',
                background: result.status === 'APPROVED' ? 'hsl(140, 60%, 92%)' : result.status === 'REJECTED' ? 'hsl(0, 80%, 93%)' : result.status === 'VERIFIED' ? 'hsl(260, 60%, 94%)' : 'hsl(40, 95%, 90%)',
                color: result.status === 'APPROVED' ? 'hsl(140, 70%, 25%)' : result.status === 'REJECTED' ? 'hsl(0, 70%, 40%)' : result.status === 'VERIFIED' ? 'hsl(260, 60%, 35%)' : 'hsl(40, 95%, 30%)',
              }}>
                {result.status === 'APPROVED' ? <CheckCircle2 size={14} /> : result.status === 'REJECTED' ? <XCircle size={14} /> : <Clock size={14} />}
                <span>{result.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
          </div>

          {/* Admin Message */}
          {result.adminMessage && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.25rem',
              borderRadius: '10px', background: 'hsl(220, 70%, 97%)', border: '1px solid hsl(220, 40%, 88%)',
              marginBottom: '1.5rem',
            }}>
              <MessageSquare size={18} style={{ color: 'hsl(220, 65%, 35%)', flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(220, 40%, 45%)', letterSpacing: '0.05em' }}>Message from Admissions Office</span>
                <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.9375rem', color: 'hsl(220, 35%, 20%)', lineHeight: 1.6 }}>{result.adminMessage}</p>
              </div>
            </div>
          )}

          {/* Applicant Info Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem', padding: '1.25rem', borderRadius: '10px',
            background: 'hsl(220, 20%, 97%)', marginBottom: '2rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={13} /> Applicant Student
              </span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem', color: 'hsl(220, 35%, 15%)', marginTop: '0.25rem' }}>
                {result.applicantName}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <GraduationCap size={13} /> Class Applied For
              </span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem', color: 'hsl(220, 35%, 15%)', marginTop: '0.25rem' }}>
                {result.classApplied}
              </span>
            </div>
            {result.session && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)' }}>Session</span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem', color: 'hsl(220, 35%, 15%)', marginTop: '0.25rem' }}>
                  {result.session}
                </span>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} /> Date Submitted
              </span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem', color: 'hsl(220, 35%, 15%)', marginTop: '0.25rem' }}>
                {new Date(result.submissionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Admission Progress Tracker */}
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 20%, 40%)', marginBottom: '1.25rem' }}>
            {isRejected ? 'Application Status' : 'Admission Workflow Progress'}
          </h4>

          {isRejected ? (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem',
              borderRadius: '10px', background: 'hsl(0, 80%, 97%)', border: '1px solid hsl(0, 70%, 90%)',
              marginBottom: '1.75rem',
            }}>
              <XCircle size={28} style={{ color: 'hsl(0, 70%, 45%)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'hsl(0, 70%, 35%)', marginBottom: '0.375rem' }}>Application Not Approved</div>
                <p style={{ fontSize: '0.9375rem', color: 'hsl(0, 40%, 40%)', lineHeight: 1.6, margin: 0 }}>
                  Unfortunately, your admission application has not been approved at this time. Please contact the school office for further details.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
              {[
                { idx: 1, title: 'Application Form Submitted', desc: 'Online application successfully logged into the school admissions database.' },
                { idx: 2, title: 'Admissions Office Review', desc: 'Candidate age criteria, previous school marks, and initial documentation are screened.' },
                { idx: 3, title: 'Document Verification & Interaction', desc: 'Original certificates verified and candidate interactive assessment.' },
                { idx: 4, title: 'Final Admission Approval & Enrolment', desc: 'Official admission granted and student enrollment confirmed.' },
              ].map((st) => {
                const isDone = stepIndex >= st.idx
                const isCurrent = stepIndex === st.idx
                return (
                  <div key={st.idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isDone ? 'hsl(140, 60%, 92%)' : isCurrent ? 'hsl(40, 95%, 90%)' : 'hsl(220, 20%, 92%)',
                      color: isDone ? 'hsl(140, 70%, 30%)' : isCurrent ? 'hsl(40, 95%, 35%)' : 'hsl(220, 15%, 60%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
                    }}>
                      {isDone ? <CheckCircle2 size={16} /> : st.idx}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: isDone || isCurrent ? 'hsl(220, 35%, 15%)' : 'hsl(220, 15%, 55%)' }}>{st.title}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', lineHeight: 1.4, marginTop: '0.2rem' }}>{st.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Status History Timeline */}
          {result.statusHistory && result.statusHistory.length > 0 && (
            <div style={{ borderTop: '1px solid hsl(220, 20%, 92%)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(220, 20%, 40%)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={14} /> Activity Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {result.statusHistory.map((entry, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem', background: 'hsl(220, 20%, 98%)', borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', whiteSpace: 'nowrap', paddingTop: '0.1rem' }}>
                      {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'hsl(220, 35%, 20%)' }}>
                        {entry.fromStatus ? `${entry.fromStatus.replace(/_/g, ' ')} → ${entry.toStatus.replace(/_/g, ' ')}` : entry.toStatus.replace(/_/g, ' ')}
                      </span>
                      {entry.notes && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)' }}>{entry.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', borderTop: '1px solid hsl(220, 20%, 92%)', paddingTop: '1rem', margin: 0 }}>
            Need help or have inquiries about your child's application? Contact the MK Convent Admissions Helpdesk at <strong>8858514567</strong> or visit the Sukkhipur campus office during working hours.
          </p>
        </PublicCard>
      )}
    </div>
  )
}
