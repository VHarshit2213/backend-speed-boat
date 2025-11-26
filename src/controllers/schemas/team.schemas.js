import { z } from 'zod';

const SettingsSchema = z.object({
  accessTemplate:  z.boolean().optional(),
  accessSchedules: z.boolean().optional(),
  createEvent:     z.boolean().optional(),
  editMap:         z.boolean().optional(),
  createMap:       z.boolean().optional(),
  notification: z.object({
    email: z.boolean().optional(),
    sms:   z.boolean().optional(),
    push:  z.boolean().optional(),
  }).optional(),
});

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    designation: z.string().min(1, 'Designation is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().min(1, 'Mobile number is required'),
    role: z.string().min(1, 'Role is required'), // user.role for the created user
    settings: SettingsSchema.optional(),          // initial settings (optional)
  })
});

export const updateTeamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    // update settings partially
    settings: SettingsSchema.optional(),
  })
});