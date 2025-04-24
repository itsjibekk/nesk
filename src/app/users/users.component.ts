import { Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgForOf} from '@angular/common';


@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    DatePipe,
    NgForOf
  ],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.css'
})

export class UsersComponent {
  users: any[] = [];
  searchQuery: string = '';

}

