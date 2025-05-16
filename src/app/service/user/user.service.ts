import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/users';

  constructor() {
    axios.defaults.baseURL = 'http://localhost:8080';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }

  private getAuthToken(): string | null {
    return window.localStorage.getItem('auth_token');
  }

  getUsers(): Promise<any[]> {
    const headers: any = {};

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return axios
      .get(this.apiUrl, { headers })
      .then(response => response.data);
  }
  createUser(user: User): Promise<any> {
    const token = localStorage.getItem('auth_token');
    return axios.post('/api/users', user, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  updateUser(user: User): Promise<any> {
    const token = localStorage.getItem('auth_token');
    return axios.put(`/api/users/${user.id}`, user, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }



// user.service.ts
  deleteUser(userId: number): Promise<void> {
    const headers: any = {};
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return axios.delete(`${this.apiUrl}/${userId}`, { headers })
      .then(() => {})
      .catch(error => {
        // Добавьте логирование ошибки
        console.error('API Error:', error.response?.data || error.message);
        throw error; // Перебросьте ошибку для обработки в компоненте
      });
  }

}

