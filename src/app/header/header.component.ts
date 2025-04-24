import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {ButtonsComponent} from '../buttons/buttons.component';

@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, ButtonsComponent, NgIf],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() pageTitle!: string;
  @Input() logoSrc!: string;
  @Input() isLoggedIn: boolean = false;

  @Output() loginEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() mapsEvent = new EventEmitter<void>();
  @Output() manageUsersEvent = new EventEmitter<void>();

  onLoginClicked() {
    this.loginEvent.emit();
  }

  onLogoutClicked() {
    this.logoutEvent.emit();
  }

  onMapsClicked() {
    this.mapsEvent.emit();
  }
  onManageUsersClicked(){
    this.manageUsersEvent.emit();
  }
}

