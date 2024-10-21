import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Person, CacheItem, PeopleSchema } from 'shared/src/lib/schemas';

@Injectable()
export class SwapiService {
  private apiUrl = 'https://www.swapi.tech/api/people';
  private cache: Record<number, CacheItem> = {}; // Specify the cache type here

  async getPeople(page = 1): Promise<CacheItem> {
    if (this.cache[page]) {
      return this.cache[page];
    }

    const response = await axios.get(`${this.apiUrl}/?page=${page}`);
    const people = response.data.results;
    console.log('PEOPLE', people);
    // Fetch and enrich each person's homeworld data
    const enrichedPeople = await Promise.all(
      people.map(async (person: Person) => {
        // Fetch the homeworld using the URL provided in person.homeworld
        const homeworldResponse = await axios.get(person.homeworld);

        const enrichedPerson = {
          ...person,
          homeworldDetails: {
            name: homeworldResponse.data.name,
            terrain: homeworldResponse.data.terrain,
          },
        };

        // Validate using Zod schema
        return PeopleSchema.parse({
          name: enrichedPerson.name,
          birth_year: enrichedPerson.birth_year,
          homeworld: {
            name: enrichedPerson.homeworldDetails.name,
            terrain: enrichedPerson.homeworldDetails.terrain,
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
