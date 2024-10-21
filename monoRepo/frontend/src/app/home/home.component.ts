import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SwapiService } from '@shared/lib/services/swapi.service';
import { Person, CacheItem } from '@shared/lib/schemas';
import { PeopleComponent } from '../people/people.component';
import { tap } from 'rxjs';

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

  constructor(private swapiService: SwapiService) {}

  ngOnInit() {
    this.getPeople(1);
  }

  getPeople(page: number): void {
    this.swapiService
      .getPeople(page)
      .pipe(
        tap((response: CacheItem) => {
          this.people = response.data; // Set the people array from the response
        })
      )
      .subscribe({
        // response
        next: () => {
          // You can handle success if needed, but it's already handled in tap
        },
        error: (e) => {
          console.error('Error fetching people: ', e);
        },
      });
  }
}
