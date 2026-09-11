'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CheckCircle2, Upload, X, Loader2, ChevronRight, ChevronLeft, AlertCircle, Printer } from 'lucide-react'
import { CLASS_OPTIONS } from '@/lib/constants'

interface AdmissionSettings {
  admission_enabled: string
  admission_session: string
  admission_available_classes: string
  admission_class_status: string
  admission_required_documents: string
  admission_confirmation_message: string
  admission_contact_info: string
}

interface UploadedDoc {
  name: string
  file: File | null
}

interface ConfirmData {
  referenceNumber: string
  studentName: string
  classApplied: string
  session: string
  submittedAt: string
  confirmationMessage: string
}

const STEPS = [
  { id: 1, label: 'Student Info' },
  { id: 2, label: 'Parent / Guardian' },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Previous School' },
  { id: 5, label: 'Documents' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 0.875rem', borderRadius: '10px',
  border: '1.5px solid hsl(220, 20%, 80%)', fontSize: '0.9375rem', fontFamily: 'inherit',
  background: '#fff', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: 'hsl(220, 25%, 25%)',
}

export function ApplyClient({ settings }: { settings: AdmissionSettings }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState<ConfirmData | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Parse settings
  const availableClasses: string[] = JSON.parse(settings.admission_available_classes || '[]')
  const classStatus: Record<string, string> = JSON.parse(settings.admission_class_status || '{}')
  const requiredDocs: string[] = JSON.parse(settings.admission_required_documents || '[]')
  const admissionEnabled = settings.admission_enabled === 'true'

  // Step 1 — Student
  const [sFirstName, setSFirstName] = useState('')
  const [sLastName, setSLastName] = useState('')
  const [sGender, setSGender] = useState('')
  const [sDob, setSdob] = useState('')
  const [sClass, setSClass] = useState('')
  const [sPhoto, setSPhoto] = useState<File | null>(null)

  // Step 2 — Parent
  const [pFatherName, setPFatherName] = useState('')
  const [pFatherOccupation, setPFatherOccupation] = useState('')
  const [pFatherPhone, setPFatherPhone] = useState('')
  const [pFatherEmail, setPFatherEmail] = useState('')
  const [pMotherName, setPMotherName] = useState('')
  const [pMotherOccupation, setPMotherOccupation] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pEmail, setPEmail] = useState('')

  // Step 3 — Address
  const [aAddress, setAAddress] = useState('')
  const [aCity, setACity] = useState('')
  const [aState, setAState] = useState('Uttar Pradesh')
  const [aPincode, setAPincode] = useState('')

  // Step 4 — Previous School
  const [prevSchool, setPrevSchool] = useState('')
  const [prevClass, setPrevClass] = useState('')
  const [prevBoard, setPrevBoard] = useState('')
  const [prevPercentage, setPrevPercentage] = useState('')

  // Step 5 — Documents
  const [docs, setDocs] = useState<UploadedDoc[]>(requiredDocs.map(name => ({ name, file: null })))

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!sFirstName.trim()) return 'First name is required'
      if (!sLastName.trim()) return 'Last name is required'
      if (!sGender) return 'Please select gender'
      if (!sDob) return 'Date of birth is required'
      if (!sClass) return 'Please select class applying for'
    }
    if (step === 2) {
      if (!pFatherName.trim()) return "Father's name is required"
      if (!pMotherName.trim()) return "Mother's name is required"
      if (!pPhone.trim()) return 'Primary phone is required'
      if (!/^\d{10}$/.test(pPhone.replace(/\s|-/g, ''))) return 'Phone must be 10 digits'
    }
    if (step === 3) {
      if (!aAddress.trim()) return 'Address is required'
      if (!aCity.trim()) return 'City is required'
      if (!aState.trim()) return 'State is required'
      if (!aPincode.trim()) return 'PIN code is required'
      if (!/^\d{6}$/.test(aPincode)) return 'PIN code must be 6 digits'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep(currentStep)
    if (err) { setSubmitError(err); return }
    setSubmitError('')
    setCurrentStep(s => Math.min(5, s + 1))
  }

  const handleBack = () => { setSubmitError(''); setCurrentStep(s => Math.max(1, s - 1)) }

  const handleDocFile = (index: number, file: File | null) => {
    setDocs(prev => prev.map((d, i) => i === index ? { ...d, file } : d))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSPhoto(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async () => {
    const err = validateStep(1) || validateStep(2) || validateStep(3)
    if (err) { setSubmitError(err); return }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const fd = new FormData()
      fd.append('studentFirstName', sFirstName.trim())
      fd.append('studentLastName', sLastName.trim())
      fd.append('studentGender', sGender)
      fd.append('studentDob', sDob)
      fd.append('classApplied', sClass)
      if (sPhoto) fd.append('studentPhoto', sPhoto)
      fd.append('fatherName', pFatherName.trim())
      fd.append('fatherOccupation', pFatherOccupation.trim())
      fd.append('fatherPhone', pFatherPhone.trim())
      fd.append('fatherEmail', pFatherEmail.trim())
      fd.append('motherName', pMotherName.trim())
      fd.append('motherOccupation', pMotherOccupation.trim())
      fd.append('phone', pPhone.trim())
      fd.append('email', pEmail.trim())
      fd.append('address', aAddress.trim())
      fd.append('city', aCity.trim())
      fd.append('state', aState.trim())
      fd.append('pincode', aPincode.trim())
      fd.append('previousSchool', prevSchool.trim())
      fd.append('previousClass', prevClass.trim())
      fd.append('previousBoard', prevBoard.trim())
      fd.append('previousPercentage', prevPercentage.trim())

      docs.forEach((doc, i) => {
        if (doc.file) {
          fd.append(`document_${i}`, doc.file)
          fd.append(`docName_${i}`, doc.name)
        }
      })

      const res = await fetch('/api/public/admissions/apply', { method: 'POST', body: fd })
      const json = await res.json()

      if (json.success) {
        setConfirmed({
          referenceNumber: json.data.referenceNumber,
          studentName: json.data.studentName,
          classApplied: json.data.classApplied,
          session: json.data.session,
          submittedAt: json.data.submittedAt,
          confirmationMessage: json.data.confirmationMessage,
        })
      } else {
        const details = json.error?.details
        if (Array.isArray(details)) setSubmitError(details.join(' | '))
        else setSubmitError(json.error?.message || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Admission Closed ──────────────────────────────────────────────
  if (!admissionEnabled) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsl(0, 80%, 95%)', color: 'hsl(0, 70%, 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Admissions Currently Closed</h2>
        <p style={{ color: 'hsl(220, 15%, 45%)', lineHeight: 1.7 }}>
          {settings.admission_contact_info || 'Admissions are not currently open. Please check back later or contact the school office for more information.'}
        </p>
      </div>
    )
  }

  // ── Confirmation Screen ───────────────────────────────────────────
  if (confirmed) {
    return (
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 32px rgba(0,0,0,0.1)', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'hsl(140, 60%, 92%)', color: 'hsl(140, 70%, 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'hsl(140, 70%, 25%)' }}>Application Submitted!</h2>
          <p style={{ color: 'hsl(220, 15%, 45%)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {confirmed.confirmationMessage}
          </p>

          <div style={{ background: 'hsl(220, 70%, 96%)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'hsl(220, 40%, 50%)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Application Reference Number</p>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace', color: 'hsl(220, 65%, 28%)', letterSpacing: '0.1em' }}>{confirmed.referenceNumber}</div>
            <p style={{ fontSize: '0.8125rem', color: 'hsl(220, 20%, 55%)', marginTop: '0.75rem' }}>Please save this number. Use it to track your application status.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem', textAlign: 'left' }}>
            {[
              ['Student Name', confirmed.studentName],
              ['Class Applied', confirmed.classApplied],
              ['Session', confirmed.session],
              ['Submitted', new Date(confirmed.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'hsl(220, 20%, 97%)', padding: '0.875rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(220, 15%, 50%)', display: 'block', marginBottom: '0.25rem' }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`/admissions/status?ref=${confirmed.referenceNumber}`}
              style={{ padding: '0.75rem 1.5rem', background: 'hsl(220, 65%, 28%)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem' }}>
              Track Application Status
            </a>
            <button onClick={() => window.print()}
              style={{ padding: '0.75rem 1.5rem', background: 'hsl(220, 20%, 95%)', color: 'hsl(220, 35%, 25%)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} /> Print Confirmation
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', minWidth: '80px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                background: currentStep > step.id ? 'hsl(140, 60%, 40%)' : currentStep === step.id ? 'hsl(220, 65%, 28%)' : 'hsl(220, 20%, 88%)',
                color: currentStep >= step.id ? '#fff' : 'hsl(220, 15%, 55%)',
              }}>
                {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: currentStep === step.id ? 'hsl(220, 65%, 28%)' : 'hsl(220, 15%, 55%)', whiteSpace: 'nowrap' }}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: currentStep > step.id ? 'hsl(140, 60%, 40%)' : 'hsl(220, 20%, 88%)', minWidth: '20px', marginBottom: '1.5rem' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Banner */}
      {submitError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: '10px', background: 'hsl(0, 80%, 96%)', border: '1px solid hsl(0, 70%, 88%)', color: 'hsl(0, 70%, 40%)', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9375rem' }}>{submitError}</span>
        </div>
      )}

      {/* Form Card */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'hsl(220, 65%, 28%)', marginBottom: '1.5rem', paddingBottom: '0.875rem', borderBottom: '2px solid hsl(220, 20%, 92%)' }}>
          Step {currentStep}: {STEPS[currentStep - 1].label}
        </h2>

        {/* STEP 1 — Student */}
        {currentStep === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div><label style={labelStyle}>First Name *</label><input style={inputStyle} value={sFirstName} onChange={e => setSFirstName(e.target.value)} placeholder="e.g. Aryan" /></div>
            <div><label style={labelStyle}>Last Name *</label><input style={inputStyle} value={sLastName} onChange={e => setSLastName(e.target.value)} placeholder="e.g. Singh" /></div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select style={inputStyle} value={sGender} onChange={e => setSGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label style={labelStyle}>Date of Birth *</label><input style={inputStyle} type="date" value={sDob} onChange={e => setSdob(e.target.value)} max={new Date().toISOString().split('T')[0]} /></div>
            <div>
              <label style={labelStyle}>Class Applying For *</label>
              <select style={inputStyle} value={sClass} onChange={e => setSClass(e.target.value)}>
                <option value="">Select Class</option>
                {availableClasses.map(cls => {
                  const status = classStatus[cls] || 'Open'
                  const disabled = status === 'Closed'
                  return <option key={cls} value={cls} disabled={disabled}>{cls} {status !== 'Open' ? `(${status})` : ''}</option>
                })}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Student Photo</label>
              <div style={{ border: '2px dashed hsl(220, 20%, 82%)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                {photoPreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={photoPreview} alt="preview" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button onClick={() => { setSPhoto(null); setPhotoPreview(null) }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: 'hsl(0, 70%, 45%)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'hsl(220, 20%, 55%)' }}>
                    <Upload size={22} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upload Photo</span>
                    <span style={{ fontSize: '0.75rem' }}>JPEG, PNG (max 5MB)</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Parent */}
        {currentStep === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div><label style={labelStyle}>Father's Full Name *</label><input style={inputStyle} value={pFatherName} onChange={e => setPFatherName(e.target.value)} /></div>
            <div><label style={labelStyle}>Father's Occupation</label><input style={inputStyle} value={pFatherOccupation} onChange={e => setPFatherOccupation(e.target.value)} /></div>
            <div><label style={labelStyle}>Father's Phone</label><input style={inputStyle} type="tel" value={pFatherPhone} onChange={e => setPFatherPhone(e.target.value)} /></div>
            <div><label style={labelStyle}>Father's Email</label><input style={inputStyle} type="email" value={pFatherEmail} onChange={e => setPFatherEmail(e.target.value)} /></div>
            <div><label style={labelStyle}>Mother's Full Name *</label><input style={inputStyle} value={pMotherName} onChange={e => setPMotherName(e.target.value)} /></div>
            <div><label style={labelStyle}>Mother's Occupation</label><input style={inputStyle} value={pMotherOccupation} onChange={e => setPMotherOccupation(e.target.value)} /></div>
            <div><label style={labelStyle}>Primary Contact Phone *</label><input style={inputStyle} type="tel" placeholder="10-digit mobile" value={pPhone} onChange={e => setPPhone(e.target.value)} /></div>
            <div><label style={labelStyle}>Email Address</label><input style={inputStyle} type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} /></div>
          </div>
        )}

        {/* STEP 3 — Address */}
        {currentStep === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Full Residential Address *</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={aAddress} onChange={e => setAAddress(e.target.value)} placeholder="House/Flat No, Street, Locality..." /></div>
            <div><label style={labelStyle}>City *</label><input style={inputStyle} value={aCity} onChange={e => setACity(e.target.value)} /></div>
            <div>
              <label style={labelStyle}>State *</label>
              <select style={inputStyle} value={aState} onChange={e => setAState(e.target.value)}>
                {['Uttar Pradesh','Bihar','Madhya Pradesh','Rajasthan','Maharashtra','Delhi','Gujarat','West Bengal','Haryana','Punjab','Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>PIN Code *</label><input style={inputStyle} type="text" maxLength={6} value={aPincode} onChange={e => setAPincode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit PIN" /></div>
          </div>
        )}

        {/* STEP 4 — Previous School */}
        {currentStep === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <p style={{ gridColumn: '1 / -1', color: 'hsl(220, 15%, 50%)', fontSize: '0.9rem', margin: 0 }}>Fill if applicable (e.g. for Class 1 and above)</p>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Previous School Name</label><input style={inputStyle} value={prevSchool} onChange={e => setPrevSchool(e.target.value)} /></div>
            <div>
              <label style={labelStyle}>Last Class Attended</label>
              <select style={inputStyle} value={prevClass} onChange={e => setPrevClass(e.target.value)}>
                <option value="">Select</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Board (e.g. CBSE, ICSE, State)</label><input style={inputStyle} value={prevBoard} onChange={e => setPrevBoard(e.target.value)} /></div>
            <div><label style={labelStyle}>Percentage / Grade</label><input style={inputStyle} value={prevPercentage} onChange={e => setPrevPercentage(e.target.value)} placeholder="e.g. 85%" /></div>
          </div>
        )}

        {/* STEP 5 — Documents */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {docs.length === 0 && <p style={{ color: 'hsl(220, 15%, 50%)' }}>No required documents configured by admin.</p>}
            {docs.map((doc, i) => (
              <div key={i} style={{ border: '2px dashed hsl(220, 20%, 82%)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{doc.name}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'hsl(220, 15%, 55%)', marginLeft: '0.5rem' }}>PDF, JPEG, PNG (max 5MB)</span>
                  </div>
                  {doc.file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(140, 70%, 30%)', fontWeight: 600, fontSize: '0.875rem' }}>
                      <CheckCircle2 size={16} /> {doc.file.name}
                      <button onClick={() => handleDocFile(i, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(0, 70%, 45%)', display: 'flex' }}><X size={15} /></button>
                    </div>
                  ) : (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'hsl(220, 70%, 94%)', color: 'hsl(220, 65%, 28%)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Upload size={15} /> Upload
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => handleDocFile(i, e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(220, 20%, 92%)' }}>
          <button onClick={handleBack} disabled={currentStep === 1}
            style={{ padding: '0.75rem 1.5rem', background: currentStep === 1 ? 'hsl(220, 20%, 94%)' : '#fff', border: '1.5px solid hsl(220, 20%, 82%)', borderRadius: '10px', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentStep === 1 ? 'hsl(220, 15%, 65%)' : 'hsl(220, 35%, 25%)' }}>
            <ChevronLeft size={18} /> Back
          </button>
          {currentStep < 5 ? (
            <button onClick={handleNext}
              style={{ padding: '0.75rem 2rem', background: 'hsl(220, 65%, 28%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              style={{ padding: '0.75rem 2rem', background: isSubmitting ? 'hsl(220, 40%, 55%)' : 'hsl(140, 60%, 28%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSubmitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><CheckCircle2 size={18} /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
