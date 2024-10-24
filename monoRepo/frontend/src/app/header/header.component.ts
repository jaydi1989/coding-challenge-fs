import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component, HostListener } from '@angular/core';
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
  filter$: Observable<string>;
  isScrolled = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.isScrolled = window.scrollY > 0;
  }

  constructor(private filterService: FilterService) {
    this.filter$ = this.filterService.filter$;
  }
  onFilterChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterService.setFilter(value);
  }
}
