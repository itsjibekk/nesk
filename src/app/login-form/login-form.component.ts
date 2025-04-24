import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    NgClass
  ],
  templateUrl: './login-form.component.html',
  standalone: true,
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {

  @Output() onSubmitLoginEvent = new EventEmitter();
  @Output() onSubmitRegisterEvent = new EventEmitter();

  active: string = ""
  firstName: string = ""
  lastName: string = ""
  login: string = "";
  password: string = "";

  onLoginTab(): void{
    this.active = "login";
  }
  onRegisterTab(): void{
    this.active = "register";
  }
  onSubmitLogin(): void{
    this.onSubmitLoginEvent.emit({"login": this.login, "password": this.password});
  }

  onSubmitRegister() {
    this.onSubmitRegisterEvent.emit({
      "firstName" : this.firstName, "lastName" : this.lastName,
      "login": this.login, "password": this.password});
  }

}
