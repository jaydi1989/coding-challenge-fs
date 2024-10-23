import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  Person,
  PeopleAppData,
  PeopleResponse,
  DetailedPersonResponse,
  Homeworld,
  HomeWorldResponse,
} from 'shared/src/lib/schemas';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class SwapiService {
  private apiUrl = 'https://www.swapi.tech/api/people';
  FETCH_LIMIT = 10;
  constructor(private readonly httpService: HttpService) {}

  private async getHomeWorldName(url: string): Promise<HomeWorldResponse> {
    try {
      const homeworldInfo: HomeWorldResponse = await lastValueFrom(
        this.httpService.get(url).pipe(
          map((res) => res.data.result.properties),
          catchError((error) => {
            console.error('Error fetching homeworld:', error.message);
            throw new HttpException(
              'Failed to fetch homeworld',
              HttpStatus.BAD_REQUEST
            );
          })
        )
      );
      return homeworldInfo;
    } catch (e: any) {
      console.log(e);
      throw new HttpException(
        'Failed to fetch homeworld',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getPersonDetails(uid: number): Promise<Person> {
    try {
      const personDetails: DetailedPersonResponse = await lastValueFrom(
        this.httpService.get(`https://www.swapi.tech/api/people/${uid}`).pipe(
          map((res) => res.data.result.properties),
          catchError((error) => {
            console.error('Error fetching person:', error.message);
            throw new HttpException(
              'Failed to fetch person',
              HttpStatus.BAD_REQUEST
            );
          })
        )
      );
      const homeworld = await this.getHomeWorldName(personDetails.homeworld);
      const { name, birth_year } = personDetails;

      const personFullData = {
        uid,
        name,
        birth_year,
        homeworld: homeworld.name,
        terrain: homeworld.terrain,
      };
      return personFullData;
    } catch (e: any) {
      throw new HttpException(
        'Failed to fetch person',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Member function getPeople
  async getPeople(page = 1): Promise<PeopleAppData> {
    try {
      // Fetch people data from the API using HttpService
      const peopleResponse: PeopleResponse = await lastValueFrom(
        this.httpService
          .get(`${this.apiUrl}?page=${page}&limit=${this.FETCH_LIMIT}`)
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              console.error('Error fetching people:', error.message);
              throw new HttpException(
                'Failed to fetch people',
                HttpStatus.BAD_REQUEST
              );
            })
          )
      );

      const people = peopleResponse.results;

      // Fetch and enrich each person's homeworld data
      const personDetails = await Promise.all(
        people.map(async (person) => await this.getPersonDetails(person.uid))
      );

      // Combine the person data with the homeworld data
      return {
        people: personDetails,
        total: 1,
      };
    } catch (e: any) {
      console.log(e);
      throw new HttpException(
        'Failed to fetch people',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
