import { z } from 'zod';

export const REPORT_CATEGORIES = [
  'HARASSMENT',
  'FAKE_PROFILE',
  'SCAM_BROKER',
  'INAPPROPRIATE',
  'OTHER',
] as const;

export type ReportCategoryForm = (typeof REPORT_CATEGORIES)[number];

export const reportFormSchema = z.object({
  category: z.enum(REPORT_CATEGORIES, { required_error: 'Choose a category' }),
  detail: z.string().max(1000).optional(),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;
