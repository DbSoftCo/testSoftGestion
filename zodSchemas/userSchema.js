// src/modules/rrhh/schemas/userSchemas.js
import { z } from 'zod';

// Esquema para la dirección
const addressSchema = z.object({
  country: z.string(),
  state: z.string(),
  city: z.string(),
  apartment: z.boolean().optional(),
  houseNumber: z.number(),
  floor: z.string().optional(),
  door: z.string().optional(),
  street: z.string(),
  postalCode: z.string(),
});

// Esquema para los datos de autenticación
const authDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  oldPasswords: z.array(z.string()),
  firstLogin: z.boolean(),
  status: z.boolean(),
});

// Esquema para detalles de trabajo
const workDetailsSchema = z.object({
  role: z.string(),
  supervisor: z.boolean(),
  activityStartDate: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
  employeeType: z.enum(['INFORMAL', 'FORMAL']),
  workIn: z.array(z.string()),
});

// Esquema para nómina
const payrollSchema = z.object({
  workingHours: z.number(),
  amountPerHourARS: z.number(),
  amountPerHourUSD: z.number(),
  paymentSchedule: z.array(z.string()),
  payoutCurrency: z.enum(['ARS', 'USD']),
  salary: z.number(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  transferType: z.string().optional(),
  employerContributions: z.string().optional(),
  taxAuthority: z.boolean().optional(),
});

// Esquema para el usuario
export const userResponseSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  CUIT: z.string(),
  gender: z.string(),
  birthDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  DNI: z.string(),
  phone: z.string(),
  image: z.string().optional(),
  companyId: z.string(),
  address: addressSchema,
  authData: authDataSchema,
  payroll: payrollSchema.optional(),
  workDetails: workDetailsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

export { addressSchema, authDataSchema, workDetailsSchema, payrollSchema };
