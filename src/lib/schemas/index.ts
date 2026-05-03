import { z } from 'zod';

/** Placeholder — form schemas will align with API Zod shapes from burrow-api. */
export const emailFieldSchema = z.string().email();

export type EmailField = z.infer<typeof emailFieldSchema>;
