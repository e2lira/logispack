import { z } from 'astro/zod';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const familySchema = z.object({
  id: slug,
  name: z.string().min(1),
  order: z.number().int().positive(),
});

/** `id` doubles as the URL slug of /servicios/[slug]/. */
export const serviceSchema = z.object({
  id: slug,
  family: slug,
  name: z.string().min(1),
  summary: z.string().min(1).max(155),
  scope: z.array(z.string().min(1)).min(1),
});

export const faqSchema = z.object({
  id: slug,
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const trustSchema = z.object({
  id: slug,
  title: z.string().min(1),
  copy: z.string().min(1),
});

export const processSchema = z.object({
  id: slug,
  title: z.string().min(1),
  copy: z.string().min(1),
});
