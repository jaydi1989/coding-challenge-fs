// apps/frontend/src/app/services/swapi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CacheItem } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class SwapiService {
  private readonly apiUrl = 'http://localhost:3000/api/people'; // Backend endpoint

  constructor(private http: HttpClient) {}

  getPeople(page: number): Observable<CacheItem> {
    return this.http.get<CacheItem>(`${this.apiUrl}?page=${page}`);
  }
}
