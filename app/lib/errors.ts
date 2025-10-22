/**
 * Custom Error Classes
 * Centralized error handling with specific error types
 */

import { logger } from './logger'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições', public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados') {
    super(message, 500, 'DATABASE_ERROR', false)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `Erro no serviço externo: ${service}`, 502, 'EXTERNAL_SERVICE_ERROR', false)
  }
}

/**
 * Error handler for API routes
 */
export function handleError(error: unknown): {
  message: string
  statusCode: number
  code?: string
  fields?: Record<string, string>
} {
  // Log the error
  logger.error('Error occurred', error)

  // Handle known errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      fields: error instanceof ValidationError ? error.fields : undefined,
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    const fields: Record<string, string> = {}
    zodError.issues.forEach((issue) => {
      const field = issue.path.join('.')
      fields[field] = issue.message
    })
    return {
      message: 'Erro de validação',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      fields,
    }
  }

  // Handle unknown errors
  logger.error('Unknown error', error)
  return {
    message: 'Erro interno do servidor',
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
  }
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler<T>(
  fn: (...args: unknown[]) => Promise<T>
): (...args: unknown[]) => Promise<T> {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error
    }
  }
}

/**
 * Safe error message for client
 * Hides sensitive information in production
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.isOperational) {
    return error.message
  }

  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error)
  }

  return 'Ocorreu um erro. Por favor, tente novamente.'
}
