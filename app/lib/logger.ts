/**
 * Structured Logging
 * Centralized logging with different levels and structured output
 */

import { isDevelopment } from './env'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!isDevelopment()) {
      return level === LogLevel.WARN || level === LogLevel.ERROR
    }
    return true
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context))
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      }
      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext))
    }
  }

  // Security-specific logging
  security(event: string, context?: LogContext): void {
    this.warn(`🔒 SECURITY: ${event}`, context)
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`⚡ PERFORMANCE: ${operation} took ${duration}ms`, context)
  }
}

export const logger = new Logger()

// Performance measurement helper
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = Date.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = Date.now() - start
      logger.performance(operation, duration)
    })
  }
  
  const duration = Date.now() - start
  logger.performance(operation, duration)
  return Promise.resolve(result)
}
