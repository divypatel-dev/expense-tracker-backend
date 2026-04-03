import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const expenseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required').trim(),
  date: z.string().or(z.date()),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .optional(),
});

export const incomeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  amount: z.number().positive('Amount must be positive'),
  source: z.string().min(1, 'Source is required').trim(),
  date: z.string().or(z.date()),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name cannot exceed 50 characters')
    .trim(),
  type: z.enum(['expense', 'income']),
  icon: z.string().optional().default('📦'),
  color: z.string().optional().default('#6366f1'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
