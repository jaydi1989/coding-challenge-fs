// apps/frontend/src/app/services/swapi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeopleAppData } from '../../../../shared/src/lib/schemas';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private readonly apiUrl = 'http://localhost:3000/api/people';

  constructor(private http: HttpClient) {}

  getPeople(page: number): Observable<PeopleAppData> {
    return this.http.get<PeopleAppData>(`${this.apiUrl}?page=${page}`);
  }
}
