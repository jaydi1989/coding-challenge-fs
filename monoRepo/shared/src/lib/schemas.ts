import { z } from 'zod';

export const HomeworldSchema = z.object({
  name: z.string(),
  terrain: z.string(),
});

export const PersonSchema = z.object({
  name: z.string(),
  birth_year: z.string(),
  homeworld: z.string(),
  terrain: z.string(),
});

export const CacheItemSchema = z.object({
  data: z.array(PersonSchema),
  total: z.number(),
});

export const PeopleSchema = z.array(PersonSchema);

export type CacheItem = z.infer<typeof CacheItemSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Homeworld = z.infer<typeof HomeworldSchema>;
