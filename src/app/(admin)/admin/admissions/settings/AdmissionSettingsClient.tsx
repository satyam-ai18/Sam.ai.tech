'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/admin/ui/Card'
import { useToast } from '@/components/admin/ui/Toast'
import { Save, Loader2, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react'

interface AdmissionSettings {
  admission_enabled: string
  admission_session: string
  admission_start_date: string
  admission_end_date: string
  admission_heading: string
  admission_intro: string
  admission_available_classes: string
  admission_class_status: string
  admission_instructions: string
  admission_required_documents: string
  admission_confirmation_message: string
  admission_contact_info: string
}

export function AdmissionSettingsClient() {
  const { success, error: showError } = useToast()
  const [settings, setSettings] = useState<AdmissionSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Parsed state
  const [enabled, setEnabled] = useState(true)
  const [session, setSession] = useState('2025-26')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [heading, setHeading] = useState('')
  const [intro, setIntro] = useState('')
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [classStatus, setClassStatus] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState('')
  const [requiredDocs, setRequiredDocs] = useState<string[]>([])
  const [confirmMessage, setConfirmMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [newDoc, setNewDoc] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/admissions/settings')
      const json = await res.json()
      if (json.success) {
        const s: AdmissionSettings = json.data
        setEnabled(s.admission_enabled === 'true')
        setSession(s.admission_session || '2025-26')
        setStartDate(s.admission_start_date || '')
        setEndDate(s.admission_end_date || '')
        setHeading(s.admission_heading || '')
        setIntro(s.admission_intro || '')
        setAvailableClasses(JSON.parse(s.admission_available_classes || '[]'))
        setClassStatus(JSON.parse(s.admission_class_status || '{}'))
        setInstructions(s.admission_instructions || '')
        setRequiredDocs(JSON.parse(s.admission_required_documents || '[]'))
        setConfirmMessage(s.admission_confirmation_message || '')
        setContactInfo(s.admission_contact_info || '')
      }
    } catch {
      showError('Failed to load admission settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        admission_enabled: String(enabled),
        admission_session: session,
        admission_start_date: startDate,
        admission_end_date: endDate,
        admission_heading: heading,
        admission_intro: intro,
        admission_available_classes: JSON.stringify(availableClasses),
        admission_class_status: JSON.stringify(classStatus),
        admission_instructions: instructions,
        admission_required_documents: JSON.stringify(requiredDocs),
        admission_confirmation_message: confirmMessage,
        admission_contact_info: contactInfo,
      }

      const res = await fetch('/api/admin/admissions/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        success('Admission settings saved successfully')
      } else {
        showError(json.error?.message || 'Failed to save')
      }
    } catch {
      showError('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateClassStatus = (cls: string, val: string) => {
    setClassStatus(prev => ({ ...prev, [cls]: val }))
  }

  const addDoc = () => {
    const trimmed = newDoc.trim()
    if (trimmed && !requiredDocs.includes(trimmed)) {
      setRequiredDocs(prev => [...prev, trimmed])
      setNewDoc('')
    }
  }

  const removeDoc = (doc: string) => {
    setRequiredDocs(prev => prev.filter(d => d !== doc))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '8px',
    border: '1px solid hsl(220, 20%, 82%)',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    background: '#fff',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.4rem',
    color: 'hsl(220, 25%, 25%)',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '0.75rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading settings...</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Status & Session */}
      <Card>
        <CardHeader>
          <CardTitle>Admission System Control</CardTitle>
          <CardDescription>Control whether the admission system is active and set the current session</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Admission System Status</label>
              <button
                onClick={() => setEnabled(e => !e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: enabled ? 'hsl(140, 60%, 92%)' : 'hsl(0, 60%, 93%)',
                  color: enabled ? 'hsl(140, 70%, 30%)' : 'hsl(0, 70%, 40%)',
                  fontWeight: 700, fontSize: '0.9375rem',
                }}
              >
                {enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                {enabled ? 'ADMISSIONS OPEN' : 'ADMISSIONS CLOSED'}
              </button>
              <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 50%)', marginTop: '0.5rem' }}>
                When OFF, the public Apply form shows a closed message
              </p>
            </div>
            <div>
              <label style={labelStyle}>Current Admission Session *</label>
              <input style={inputStyle} value={session} onChange={e => setSession(e.target.value)} placeholder="e.g. 2025-26" />
            </div>
            <div>
              <label style={labelStyle}>Admission Start Date</label>
              <input style={inputStyle} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Admission End Date</label>
              <input style={inputStyle} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Content */}
      <Card>
        <CardHeader>
          <CardTitle>Public Admission Page Content</CardTitle>
          <CardDescription>Content displayed on the public admissions information page</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Admission Page Heading</label>
              <input style={inputStyle} value={heading} onChange={e => setHeading(e.target.value)} placeholder="e.g. Admissions Open for 2025–26" />
            </div>
            <div>
              <label style={labelStyle}>Introduction / Welcome Message</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={intro} onChange={e => setIntro(e.target.value)} placeholder="Welcome introduction shown on the admissions page" />
            </div>
            <div>
              <label style={labelStyle}>Application Instructions</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Step-by-step instructions for applicants" />
            </div>
            <div>
              <label style={labelStyle}>Application Confirmation Message</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={confirmMessage} onChange={e => setConfirmMessage(e.target.value)} placeholder="Message shown after successful form submission" />
            </div>
            <div>
              <label style={labelStyle}>Contact Information (for admission queries)</label>
              <input style={inputStyle} value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="Phone, email, office hours..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Status */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Admission Status</CardTitle>
          <CardDescription>Set availability per class. Only classes with Open/Coming Soon status appear as selectable</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
            {availableClasses.map(cls => (
              <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'hsl(220, 20%, 97%)', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '80px' }}>{cls}</span>
                <select
                  value={classStatus[cls] || 'Open'}
                  onChange={e => updateClassStatus(cls, e.target.value)}
                  style={{ flex: 1, padding: '0.375rem 0.5rem', borderRadius: '6px', border: '1px solid hsl(220, 20%, 82%)', fontSize: '0.875rem' }}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Documents applicants must upload during the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
              value={newDoc}
              onChange={e => setNewDoc(e.target.value)}
              placeholder="e.g. Birth Certificate"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())}
            />
            <button
              onClick={addDoc}
              style={{ padding: '0.625rem 1rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {requiredDocs.map(doc => (
              <span key={doc} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.375rem 0.75rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
                {doc}
                <button onClick={() => removeDoc(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {requiredDocs.length === 0 && <span style={{ color: 'hsl(220, 15%, 55%)', fontSize: '0.9rem' }}>No documents configured yet</span>}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 2rem', background: 'hsl(220, 65%, 28%)', color: '#fff',
            border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9375rem',
            cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
