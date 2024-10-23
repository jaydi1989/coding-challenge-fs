import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PeopleAppData, Person } from '@shared/lib/schemas';
import { PeopleComponent } from '../people/people.component';
import { Subject, tap, debounceTime } from 'rxjs';
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
  people: Person[] = [];
  filteredPeople: Person[] = [];
  page = 1;
  canFetchMore = true;
  isLoading = false;

  private readonly filteredPeopleSubject = new Subject<string>();

  constructor(
    private swapiService: SwapiService,
    private filterService: FilterService // Inject the FilterService
  ) {
    this.filteredPeopleSubject.pipe(debounceTime(500)).subscribe((filter) => {
      console.log('Debounced filter:', filter);
      this.getPeopleByName(filter);
    });
  }

  ngOnInit() {
    this.getPeople();

    // Update the local filter value when it changes in the service
    this.filterService.filter$.subscribe((filter) => {
      this.filterPeople(filter);
    });
  }

  filterPeople(filter: string): void {
    if (!filter) {
      this.filteredPeople = this.people; // Reset to all people if no filter
    } else {
      this.filteredPeople = this.people.filter((person) =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      );
      console.log(this.filteredPeople);
      if (this.filteredPeople.length === 0 || !this.filterPeople) {
        this.filteredPeopleSubject.next(filter); // Trigger subject to debounce
      }
    }
  }

  getPeopleByName(name: string): void {
    this.swapiService.getPeopleByName(name).subscribe({
      next: (res: PeopleAppData) => {
        this.filteredPeople = res.people;
      },
      error: (e) => {
        console.error('Error fetching people by name: ', e);
      },
    });
  }

  getPeople(): void {
    this.isLoading = true;
    this.swapiService
      .getPeople(this.page)
      .pipe(
        tap((response: PeopleAppData) => {
          this.people = response.people;
          this.filteredPeople = response.people;
        })
      )
      .subscribe({
        next: (people: PeopleAppData) => {
          this.isLoading = false;
          // You can handle success if needed, but it's already handled in tap
        },
        error: (e) => {
          console.error('Error fetching people: ', e);
          this.isLoading = false;
        },
      });
  }

  fetchNextPage(): void {
    if (this.canFetchMore && !this.isLoading) {
      this.page++;
      this.getPeople();
    }
  }
}
