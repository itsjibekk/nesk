import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = '/api/roles';

  constructor() {
    axios.defaults.baseURL = 'http://localhost:8080';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }
  private getAuthToken(): string | null {
    return window.localStorage.getItem('auth_token');
  }

  getRoles(): Promise<any[]> {
    const headers: any = {};

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return axios
      .get(this.apiUrl, { headers })
      .then(response => response.data);
  }

  getTools(roleId: number): Promise<any[]> {
    return axios.get(`/api/roles/${roleId}/tools`).then(res => res.data);
  }
}

