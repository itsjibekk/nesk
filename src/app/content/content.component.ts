import { Component } from '@angular/core';
import {WelcomeContentComponent} from '../welcome-content/welcome-content.component';
import {LoginFormComponent} from '../login-form/login-form.component';
import {AxiosService} from '../service/axios/axios.service';
import {ButtonsComponent} from '../buttons/buttons.component';
import {AuthContentComponent} from '../auth-content/auth-content.component';
import {NgIf} from '@angular/common';
import {MapsComponent} from '../maps/maps.component';
import {HeaderComponent} from '../header/header.component';
import {UsersComponent} from '../users/users.component';

@Component({
  selector: 'app-content',
  imports: [
    WelcomeContentComponent,
    LoginFormComponent,
    ButtonsComponent,
    AuthContentComponent,
    NgIf,
    MapsComponent,
    HeaderComponent,
    UsersComponent
  ],
  templateUrl: './content.component.html',
  standalone: true,
  styleUrl: './content.component.css'
})
export class ContentComponent {
  componentToShow: string = "welcome";
  isLoggedIn: boolean = false;
  userRole: string = '';

  constructor(private axiosService: AxiosService) {
  }

  showComponent(componentToShow:string): void{
    this.componentToShow = componentToShow;
  }
  onLogin(input: any): void{
     this.axiosService.request(
       "POST",
       "/login",
       {
         login: input.login,
         password: input.password
       }
     ).then(response => {
       this.axiosService.setAuthToken(response.data.token);
       this.isLoggedIn = true;
       this.componentToShow = "maps";
       const roles = response.data.roles?.map((role: any) => role.name) || [];
       this.userRole = roles.includes('admin') ? 'admin' : 'user';
     });
  }


  onRegister(input: any): void{
    this.axiosService.request(
      "POST",
      "/register",
      {
        firstName: input.firstName,
        lastName: input.lastName,
        login: input.login,
        password: input.password
      }
    ).then(response => {
      this.axiosService.setAuthToken(response.data.token);
      this.isLoggedIn = true;
      this.componentToShow = "maps";

    });
  }
  onLogout(): void {
    this.axiosService.setAuthToken(null);
    this.isLoggedIn = false;
    this.componentToShow = 'welcome';
  }


}
