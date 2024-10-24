import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PeopleAppData, Person } from '@shared/lib/schemas';
import { PeopleComponent } from '../people/people.component';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs';
import { SwapiService } from '../services/swapi.service';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, PeopleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  people: Person[] = []; // Two arrays to store the people data to improve client side filtering
  filteredPeople: Person[] = [];
  page = 1;
  canFetchMore = true;
  isLoading = false;
  private initialLoadCompleted = false;

  private readonly filteredPeopleSubject = new Subject<string>(); // Observable to emit filter values
  private previousFilter = ''; // This to handle rapid fire changes in input

  constructor(
    private swapiService: SwapiService,
    private filterService: FilterService
  ) {
    // Pipe got complex to handle rapid fire changes to the filter input.
    this.filteredPeopleSubject
      .pipe(
        debounceTime(500),
        filter((filterValue) => filterValue.trim() !== ''),
        distinctUntilChanged(), // Only emit when the current value is different from the last
        filter((currentFilter) => this.shouldFetchPeopleByName(currentFilter)),
        // Switch map to cancel the previous request and only emit the latest request
        switchMap((filter) => {
          this.isLoading = true;
          return this.swapiService.getPeopleByName(filter);
        })
      )
      .subscribe({
        next: (res: PeopleAppData) => {
          this.isLoading = false;
          this.filteredPeople = res.people;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  ngOnInit() {
    this.loadInitialPeople();
    this.filterService.filter$.subscribe((filter) => {
      this.filterPeople(filter);
    });
  }

  getPeople(): void {
    this.isLoading = true;
    this.swapiService.getPeople(this.page).subscribe({
      next: (response: PeopleAppData) => {
        this.isLoading = false;
        if (this.page === 1) {
          this.people = response.people;
          this.filteredPeople = response.people;
        } else {
          this.people = this.people.concat(response.people);
          this.filteredPeople = this.filteredPeople.concat(response.people);
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  filterPeople(filter: string): void {
    if (!filter) {
      this.page = 1;
      this.getPeople();
    } else {
      this.filteredPeople = this.people.filter(
        (person) => person.name.toLowerCase().includes(filter.toLowerCase()) // Try clientside filtering first
      );
      if (this.filteredPeople.length === 0) {
        this.filteredPeopleSubject.next(filter); // If no results, maybe fetch from the server
      }
    }
  }

  loadInitialPeople(): void {
    if (!this.initialLoadCompleted) {
      this.getPeople();
      this.initialLoadCompleted = true;
    }
  }

  shouldFetchPeopleByName(currentFilter: string): boolean {
    const isShorter = currentFilter.length < this.previousFilter.length;
    this.previousFilter = currentFilter;
    return !isShorter;
  }

  fetchNextPage(): void {
    if (this.canFetchMore && !this.isLoading) {
      this.page++;
      this.getPeople();
    }
  }
}
