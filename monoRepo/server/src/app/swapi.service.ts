import { writeFile, readFile } from 'fs-extra'; // Import fs-extra for easy file handling
import { join } from 'path';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  Person,
  PeopleAppData,
  PeopleResponse,
  DetailedPersonResponse,
  HomeWorldResponse,
  PeopleNameResponse,
} from 'shared/src/lib/schemas';

@Injectable()
export class SwapiService {
  private readonly swapiLogger = new Logger('SwapiLogger');
  private readonly apiUrl = 'https://www.swapi.tech/api/people';
  FETCH_LIMIT = 10;
  RETRY_LIMIT = 3; // Number of retries
  DELAY_BETWEEN_RETRIES = 1000; // Delay between retries in milliseconds
  private cacheFilePath = join(__dirname, 'cache.json');
  constructor(private readonly httpService: HttpService) {}

  async fetchPeople(page: number): Promise<PeopleResponse> {
    try {
      const peopleResponse: PeopleResponse = await lastValueFrom(
        this.httpService
          .get(`${this.apiUrl}?page=${page}&limit=${this.FETCH_LIMIT}`)
          .pipe(map((res) => res.data))
      );
      return peopleResponse;
    } catch (e: any) {
      throw new HttpException(
        'Failed to fetch people',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async retry(fn: () => Promise<PeopleResponse>): Promise<PeopleResponse> {
    let retries = 0;
    while (retries < this.RETRY_LIMIT) {
      console.log('RETRY: ', retries);
      try {
        return await fn();
      } catch (e: any) {
        retries++;
        if (retries === this.RETRY_LIMIT) {
          throw new HttpException(
            'Failed to fetch people after retries',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, this.DELAY_BETWEEN_RETRIES)
        );
      }
    }
    throw new HttpException(
      'Failed to fetch people after retries',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  // Initial fetch function for a page with caching
  async getPeople(page = 1): Promise<PeopleAppData> {
    try {
      const cacheKey = `people_${page}`;
      const cachedPeople = await this.loadCache(cacheKey);

      if (cachedPeople) {
        this.swapiLogger.log(`Returning cached people for page ${page}`);
        return cachedPeople;
      }

      const peopleResponse = await this.retry(() => this.fetchPeople(page));

      const people = peopleResponse.results;

      // Fetch and enrich each person's homeworld data
      const personDetails = await Promise.all(
        people.map(async (person) => await this.getPersonDetails(person.uid))
      );

      const dataToCache: PeopleAppData = {
        people: personDetails,
        total: peopleResponse.total,
      };

      await this.saveCache(cacheKey, dataToCache); // Save to cache file
      this.swapiLogger.log(`Cached people for page ${page}`);

      return dataToCache;
    } catch (e: any) {
      this.swapiLogger.error('GetPeople failed: ' + e.message, e.stack);
      throw new HttpException(
        'Failed to fetch people',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPeopleByName(name: string): Promise<PeopleAppData> {
    try {
      const cacheKey = `people_name_${name.toLowerCase()}`;
      const cachedPeople = await this.loadCache(cacheKey);

      if (cachedPeople) {
        this.swapiLogger.log(`Returning cached people for name ${name}`);
        return cachedPeople;
      }

      const peopleResponse: PeopleNameResponse = await lastValueFrom(
        this.httpService
          .get(`${this.apiUrl}?name=${name}`)
          .pipe(map((res) => res.data))
      );

      const people = peopleResponse.result;

      // Fetch and enrich each person's homeworld data
      const personDetails = await Promise.all(
        people.map(async (person) => await this.getPersonDetails(person.uid))
      );

      const dataToCache: PeopleAppData = {
        people: personDetails,
        total: people.length,
      };

      if (personDetails.length > 0) {
        await this.saveCache(cacheKey, dataToCache);
        this.swapiLogger.log(`Cached people for name ${name}`);
      }

      return dataToCache;
    } catch (e: any) {
      this.swapiLogger.error('GetPeopleByName failed: ' + e.message, e.stack);
      throw new HttpException(
        'Failed to fetch people by name',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getHomeWorldName(url: string): Promise<HomeWorldResponse> {
    try {
      const homeworldInfo: HomeWorldResponse = await lastValueFrom(
        this.httpService.get(url).pipe(map((res) => res.data.result.properties))
      );
      return homeworldInfo;
    } catch (e: any) {
      this.swapiLogger.error('Error fetching homeworld: ' + e.message, e.stack);
      throw new HttpException(
        'Failed to fetch homeworld',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getPersonDetails(uid: number): Promise<Person> {
    try {
      const personDetails: DetailedPersonResponse = await lastValueFrom(
        this.httpService
          .get(`https://www.swapi.tech/api/people/${uid}`)
          .pipe(map((res) => res.data.result.properties))
      );
      const homeworld = await this.getHomeWorldName(personDetails.homeworld);
      const { name, birth_year } = personDetails;

      return {
        uid,
        name,
        birth_year,
        homeworld: homeworld.name,
        terrain: homeworld.terrain,
      };
    } catch (e: any) {
      this.swapiLogger.error('Error fetching person: ' + e.message, e.stack);
      throw new HttpException(
        'Failed to fetch person',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * JSON file-based cache
   * This approach is straightforward but may be harder to deploy in production environments compared to other solutions.
   * Alternative approaches include using @nestjs/cache for in-memory caching or Redis for distributed caching.
   * This one is harder to deploy for sure
   * * Considerations:
   * - File-based caching can lead to potential data loss on server restarts if not properly managed.
   * - For production, consider more robust solutions like a dedicated cache service.
   */

  private async saveCache(
    cacheKey: string,
    data: PeopleAppData
  ): Promise<void> {
    try {
      let cache: Record<string, PeopleAppData> = {};
      try {
        const cacheData = await readFile(this.cacheFilePath, 'utf8');
        cache = JSON.parse(cacheData);
      } catch (e: any) {
        this.swapiLogger.warn('Cache file not found, creating a new one.');
      }

      // Update cache with new data
      cache[cacheKey] = data;
      await writeFile(
        this.cacheFilePath,
        JSON.stringify(cache, null, 2),
        'utf8'
      ); // Save the cache
    } catch (error: unknown) {
      // Specify error type to avoid TypeScript error
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.swapiLogger.error('Error saving cache: ' + message);
    }
  }

  private async loadCache(cacheKey: string): Promise<PeopleAppData | null> {
    try {
      const cacheData = await readFile(this.cacheFilePath, 'utf8');
      const cache: Record<string, PeopleAppData> = JSON.parse(cacheData);
      return cache[cacheKey] || null;
    } catch (e) {
      this.swapiLogger.warn(
        'Cache file not found or invalid, creating new cache.'
      );
      return null;
    }
  }
}
