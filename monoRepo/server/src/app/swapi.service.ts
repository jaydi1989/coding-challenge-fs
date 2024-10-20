import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PersonSchema, Person } from 'shared-models/src/lib/schemas';

interface CacheItem {
  data: Person[];
  total: number;
}

@Injectable()
export class SwapiService {
  private apiUrl = 'https://swapi.dev/api/people';
  private cache: Record<number, CacheItem> = {}; // Specify the cache type here

  async getPeople(page = 1): Promise<CacheItem> {
    if (this.cache[page]) {
      return this.cache[page];
    }

    const response = await axios.get(`${this.apiUrl}/?page=${page}`);
    const people = response.data.results;

    const enrichedPeople = await Promise.all(
      people.map(async (person: Person) => {
        const homeworldResponse = await axios.get(person.homeworld);
        const enrichedPerson = {
          ...person,
          homeworld: homeworldResponse.data,
        };

        // Validate using Zod schema
        return PersonSchema.parse({
          name: enrichedPerson.name,
          birth_year: enrichedPerson.birth_year,
          homeworld: {
            name: enrichedPerson.homeworld.name,
            terrain: enrichedPerson.homeworld.terrain,
          },
        });
      })
    );

    this.cache[page] = {
      data: enrichedPeople,
      total: response.data.count,
    };

    return this.cache[page];
  }
}
