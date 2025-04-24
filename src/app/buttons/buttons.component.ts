import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-buttons',
  imports: [
    NgIf
  ],
  templateUrl: './buttons.component.html',
  standalone: true,
  styleUrl: './buttons.component.css'
})
// buttons.component.ts
export class ButtonsComponent {
  @Input() isLoggedIn: boolean = false;

  @Output() loginEvent = new EventEmitter();
  @Output() logoutEvent = new EventEmitter();
  @Output() mapsEvent = new EventEmitter(); // Add this
  @Output() manageUsersEvent = new EventEmitter(); // Add this

  // Add this method
  showMaps(): void {
    this.mapsEvent.emit();
  }
  onManageUsersClicked(){
    this.manageUsersEvent.emit();
  }
}
