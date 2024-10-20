import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  screenWidth: number = window.innerWidth;
  isModalOpen = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  isMobileSize(): boolean {
    return this.screenWidth <= 1024;
  }
}
