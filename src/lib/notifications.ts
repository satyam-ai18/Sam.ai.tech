/**
 * Notification Service Abstraction
 * MK Convent School — Phase 4
 *
 * This module provides a clean abstraction for sending notifications.
 * When a provider (email/SMS/WhatsApp) is not configured, events are
 * logged to the audit system but NOT fake-sent.
 *
 * To enable email: configure notification_email_provider in Admin → Settings
 */

import { logActivity } from '@/lib/audit'

export type NotificationType =
  | 'admission_submitted'
  | 'admission_status_changed'
  | 'admission_approved'
  | 'admission_rejected'

export interface NotificationPayload {
  type: NotificationType
  recipientEmail?: string
  recipientName?: string
  referenceNumber?: string
  studentName?: string
  classApplied?: string
  status?: string
  adminMessage?: string
}

/**
 * Check if notification provider is configured.
 * In a future integration, read from DB settings.
 */
function isProviderConfigured(): boolean {
  const provider = process.env.NOTIFICATION_EMAIL_PROVIDER
  return !!(provider && provider.trim() !== '')
}

/**
 * Primary notification dispatch function.
 * Logs all events. Only dispatches if provider is configured.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const logDetails = JSON.stringify({
    type: payload.type,
    recipient: payload.recipientEmail,
    ref: payload.referenceNumber,
    student: payload.studentName,
  })

  // Always record in audit log
  await logActivity({
    action: 'NOTIFICATION_EVENT',
    module: 'notifications',
    details: `[${payload.type.toUpperCase()}] ${logDetails}`,
  })

  // If no provider configured — log and return (do NOT fake-send)
  if (!isProviderConfigured()) {
    console.log(
      `[Notifications] Provider not configured. Event logged: ${payload.type} for ${payload.recipientEmail || 'unknown'}`
    )
    return
  }

  // === Future Integration Point ===
  // When a provider (Nodemailer / Resend / Twilio) is configured:
  // const provider = process.env.NOTIFICATION_EMAIL_PROVIDER
  // if (provider === 'resend') { await sendViaResend(payload) }
  // if (provider === 'nodemailer') { await sendViaNodemailer(payload) }
  console.log(`[Notifications] Provider "${process.env.NOTIFICATION_EMAIL_PROVIDER}" configured but handler not yet implemented.`)
}

/**
 * Convenience: Send admission submitted notification
 */
export async function notifyAdmissionSubmitted(
  referenceNumber: string,
  studentName: string,
  classApplied: string,
  recipientEmail?: string
): Promise<void> {
  await sendNotification({
    type: 'admission_submitted',
    recipientEmail,
    referenceNumber,
    studentName,
    classApplied,
  })
}

/**
 * Convenience: Send status change notification
 */
export async function notifyStatusChanged(
  referenceNumber: string,
  studentName: string,
  newStatus: string,
  adminMessage?: string,
  recipientEmail?: string
): Promise<void> {
  await sendNotification({
    type: 'admission_status_changed',
    recipientEmail,
    referenceNumber,
    studentName,
    status: newStatus,
    adminMessage,
  })
}
