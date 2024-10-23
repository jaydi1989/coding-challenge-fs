import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';
import { FilterService } from '../services/filter.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  filter$: Observable<string>; // Observable to hold the filter from the service

  constructor(private filterService: FilterService) {
    this.filter$ = this.filterService.filter$; // Assign the filter observable from the service
  }
  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterService.setFilter(value); // Update the filter value in the service
  }
}
