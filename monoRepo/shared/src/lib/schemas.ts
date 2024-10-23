import { z } from 'zod';

export const HomeworldSchema = z.object({
  name: z.string(),
  terrain: z.string(),
});

export const HomeWorldResponse = z.object({
  diameter: z.string(),
  rotation_period: z.string(),
  orbital_period: z.string(),
  gravity: z.string(),
  population: z.string(),
  climate: z.string(),
  terrain: z.string(),
  surface_water: z.string(),
  created: z.string(),
  edited: z.string(),
  name: z.string(),
  url: z.string(),
});

export const PersonSchema = z.object({
  uid: z.number(),
  name: z.string(),
  birth_year: z.string(),
  homeworld: z.string(),
  terrain: z.string(),
});

export const PeopleAppData = z.object({
  people: z.array(PersonSchema),
  total: z.number(),
});

export const PeopleRessourcesSchema = z.object({
  uid: z.number(),
  name: z.string(),
  url: z.string(),
});

export const PeopleResponseSchema = z.object({
  results: z.array(PeopleRessourcesSchema),
  total: z.number(),
});

export const DatailedPeopleResponse = z.object({
  height: z.string(),
  mass: z.string(),
  hair_color: z.string(),
  skin_color: z.string(),
  eye_color: z.string(),
  birth_year: z.string(),
  gender: z.string(),
  created: z.string(),
  edited: z.string(),
  name: z.string(),
  homeworld: z.string(),
  url: z.string(),
});

export type HomeWorldResponse = z.infer<typeof HomeWorldResponse>;
export const PeopleSchema = z.array(PersonSchema);
export type PeopleAppData = z.infer<typeof PeopleAppData>;
export type Person = z.infer<typeof PersonSchema>;
export type Homeworld = z.infer<typeof HomeworldSchema>;
export type PeopleResponse = z.infer<typeof PeopleResponseSchema>;
export type DetailedPersonResponse = z.infer<typeof DatailedPeopleResponse>;
