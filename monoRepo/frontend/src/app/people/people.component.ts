import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '@shared/lib/schemas';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css',
})
export class PeopleComponent {
  @Input() person!: Person;
}
