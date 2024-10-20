import { Component } from '@angular/core';
import { HomeComponent } from './home/home.component';
// import { RouterModule } from '@angular/router';
// import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [HomeComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
}
