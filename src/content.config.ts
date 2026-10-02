import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import {
  faqSchema,
  familySchema,
  processSchema,
  serviceSchema,
  trustSchema,
} from './content/schemas';

export const collections = {
  families: defineCollection({
    loader: file('src/content/families.json'),
    schema: familySchema,
  }),
  services: defineCollection({
    loader: file('src/content/services.json'),
    schema: serviceSchema,
  }),
  faq: defineCollection({
    loader: file('src/content/faq.json'),
    schema: faqSchema,
  }),
  trust: defineCollection({
    loader: file('src/content/trust.json'),
    schema: trustSchema,
  }),
  process: defineCollection({
    loader: file('src/content/process.json'),
    schema: processSchema,
  }),
};
