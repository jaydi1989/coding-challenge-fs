import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<string>('');
  filter$: Observable<string> = this.filterSubject.asObservable();

  setFilter(value: string): void {
    this.filterSubject.next(value);
  }

  getFilter(): string {
    console.log('GET FILTER', this.filterSubject.getValue());
    return this.filterSubject.getValue();
  }
}
