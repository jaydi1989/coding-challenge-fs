import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PeopleAppData, Person } from '@shared/lib/schemas';
import { PeopleComponent } from '../people/people.component';
import { tap } from 'rxjs';
import { SwapiService } from '../services/swapi.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, PeopleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  people: Person[] = [];
  filteredPeople: Person[] = []; // Array for filtered results
  searchTerm = ''; // For search input
  page = 1; // For pagination
  canFetchMore = true;
  isLoading = false;
  constructor(private swapiService: SwapiService) {}

  ngOnInit() {
    this.getPeople();
  }

  getPeople(): void {
    this.isLoading = true;
    this.swapiService
      .getPeople(this.page)
      .pipe(
        tap((response: PeopleAppData) => {
          this.people = response.people; // Set the people array from the response
        })
      )
      .subscribe({
        // response
        next: (people: PeopleAppData) => {
          console.log('NEXT ??');
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
    console.log('EVER???');
    if (this.canFetchMore && !this.isLoading) {
      this.page++;
      this.getPeople();
    }
  }
}
