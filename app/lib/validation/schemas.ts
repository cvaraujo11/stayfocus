/**
 * Validation Schemas
 * Centralized Zod schemas for input validation
 */

import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
})

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().optional(),
  completed: z.boolean().default(false),
})

// Medication Schema
export const medicationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  dosage: z.string().min(1, 'Dosagem é obrigatória').max(50),
  frequency: z.string().min(1, 'Frequência é obrigatória').max(100),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  notes: z.string().max(500).optional(),
})

// Sleep Schema
export const sleepSchema = z.object({
  date: z.string().datetime(),
  bedtime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  wake_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  quality: z.number().min(1).max(5),
  notes: z.string().max(500).optional(),
})

// Finance Schema
export const financeSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Categoria é obrigatória').max(50),
  date: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

// Study Schema
export const studySchema = z.object({
  subject: z.string().min(1, 'Assunto é obrigatório').max(100),
  topic: z.string().min(1, 'Tópico é obrigatório').max(200),
  duration: z.number().positive('Duração deve ser positiva').max(1440), // max 24 hours in minutes
  date: z.string().datetime(),
  notes: z.string().max(1000).optional(),
})

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000) // Limit length
}

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - consider using a library like DOMPurify for production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type MedicationInput = z.infer<typeof medicationSchema>
export type SleepInput = z.infer<typeof sleepSchema>
export type FinanceInput = z.infer<typeof financeSchema>
export type StudyInput = z.infer<typeof studySchema>
