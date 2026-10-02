import { getCollection, type CollectionEntry } from 'astro:content';

export interface FamilyGroup {
  family: CollectionEntry<'families'>;
  services: CollectionEntry<'services'>[];
}

/** Families sorted by `order`, each with its services in source order. */
export async function getFamilyGroups(): Promise<FamilyGroup[]> {
  const [families, services] = await Promise.all([
    getCollection('families'),
    getCollection('services'),
  ]);
  return families
    .sort((a, b) => a.data.order - b.data.order)
    .map((family) => ({
      family,
      services: services.filter((s) => s.data.family === family.id),
    }));
}
