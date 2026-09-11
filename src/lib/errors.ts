// Centralized Error and Response Handler
// MK Convent School CMS

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type HttpStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500

const STATUS_MESSAGES: Record<HttpStatusCode, string> = {
  400: 'Bad Request',
  401: 'Unauthorized: Authentication required',
  403: 'Forbidden: You do not have permission to access this resource',
  404: 'Resource Not Found',
  409: 'Conflict: Resource already exists',
  422: 'Unprocessable Entity: Validation failed',
  429: 'Too Many Requests: Rate limit exceeded, please try again later',
  500: 'Internal Server Error: An unexpected error occurred on the server',
}

/**
 * Standardized success response
 */
export function successResponse<T>(data: T, status = 200, headers?: HeadersInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, headers }
  )
}

/**
 * Standardized error response
 * Ensures no credentials, secret keys, or raw stack traces leak to users
 */
export function errorResponse(
  status: HttpStatusCode,
  customMessage?: string,
  errors?: any
) {
  const message = customMessage || STATUS_MESSAGES[status] || 'An error occurred'

  return NextResponse.json(
    {
      success: false,
      error: {
        code: status,
        message,
        ...(errors ? { details: errors } : {}),
      },
    },
    { status }
  )
}

/**
 * Safe catch-all handler for API routes
 */
export function handleApiError(error: unknown) {
  // Handle Zod validation errors (422)
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return errorResponse(422, 'Validation failed for request data', formattedErrors)
  }

  // Log error securely on server side only
  console.error('[API Error]:', error instanceof Error ? error.message : error)

  // Never expose raw database errors or stack traces to client
  return errorResponse(500, 'An unexpected internal error occurred. Please try again.')
}
