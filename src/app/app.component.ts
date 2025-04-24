import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {AuthContentComponent} from './auth-content/auth-content.component';
import {ContentComponent} from './content/content.component';
import {FormsModule} from '@angular/forms';
import {UsersComponent} from './users/users.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, AuthContentComponent, ContentComponent,UsersComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
