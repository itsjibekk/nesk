import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe, NgForOf} from '@angular/common';
import {UserService} from '../service/user/user.service';
import {RoleService} from '../service/role/role.service';
import Swal from 'sweetalert2';
import {Role, User} from '../models/user.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    FormsModule,
    NgForOf
  ],
  templateUrl: './users.component.html',
  standalone: true,
  styleUrl: './users.component.css',
  providers: [DatePipe]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  isModalOpen = false;
  isEditing = false;
  selectedUser: User = {
    id: undefined,
    login: '',
    firstName: '',
    lastName: '',
    status: '',
    createdOn: undefined,
    roles: [],
    password: ''
  };
  availableRoles: Role[] = [];
  searchQuery = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef
  ) {}

  onAddUser() {
    this.isEditing = false;
    this.selectedUser = {
      id: undefined,
      login: '',
      firstName: '',
      lastName: '',
      status: '',
      createdOn: undefined,
      roles: [] // ✅ initialized
    };
    this.isModalOpen = true;
    this.cd.detectChanges();
  }



  onEdit(user: User) {
    this.isEditing = true;

    const matchedRoles = (user.roles ?? []).map(userRole =>
      this.availableRoles.find(ar => ar.id === userRole.id) ?? userRole
    );

    this.selectedUser = {
      ...user,
      roles: matchedRoles // ✅ always an array
    };

    this.isModalOpen = true;
  }


  addRole(event: Event): void {
    const roleId = +(event.target as HTMLSelectElement).value;
    if (!roleId) return;

    const roleToAdd = this.availableRoles.find(role => role.id === roleId);
    if (!roleToAdd) return;

    if (!this.selectedUser.roles) {
      this.selectedUser.roles = [];
    }

    const alreadyHasRole = this.selectedUser.roles.some(r => r.id === roleToAdd.id);
    if (!alreadyHasRole) {
      this.selectedUser.roles.push(roleToAdd);
    }

    // Reset dropdown selection
    (event.target as HTMLSelectElement).value = '';
  }


  removeRole(role: Role): void {
    if (!this.selectedUser.roles) return;

    this.selectedUser.roles = this.selectedUser.roles.filter(r => r.id !== role.id);
  }




  hasUserRole(roleId: number): boolean {
    return Array.isArray(this.selectedUser.roles)
      ? this.selectedUser.roles.some(r => r.id === roleId)
      : false;
  }


  closeModal() {
    this.isModalOpen = false;
  }

  // Сохранение данных
  compareRoles = (r1: Role, r2: Role) => r1 && r2 && r1.id === r2.id;

  onSaveUser() {
    // Map role objects to just IDs before sending
    const userToSave = {
      ...this.selectedUser,
      roles: this.selectedUser.roles?.map(role => ({ id: role.id })) ?? []
    };

    if (this.isEditing) {
      this.userService.updateUser(userToSave).then(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.userService.createUser(userToSave).then(() => {
        this.loadUsers();
        this.closeModal();
      });
    }
  }



  createEmptyUser(): User {
    return {
      login: '',
      firstName: '',
      lastName: '',
      status: '',
      roles: []
    };
  }




  async ngOnInit() {
    await this.loadUsers();
    await this.loadRoles();
  }
  async loadRoles() {
    try {
      const data = await this.roleService.getRoles();
      this.availableRoles = data as Role[];
      console.log('Available ролей:', this.availableRoles);
    } catch (error) {
      console.error('Ошибка при загрузке ролей:', error);
    }
  }
  async loadUsers(): Promise<void> {
    try {
      const data = await this.userService.getUsers();
      this.users = data as User[];
    } catch (error) {
      console.error('Error reloading users:', error);
    }
  }
  get filteredUsers(): User[] {
    if (!this.searchQuery.trim()) return this.users;

    const query = this.searchQuery.toLowerCase();
    return this.users.filter(user => {
      const createdOnFormatted = this.datePipe.transform(user.createdOn, 'yyyy-MM-dd HH:mm') || '';

      const searchFields = [
        user.login?.toLowerCase() ?? '',
        user.lastName?.toLowerCase() ?? '',
        user.firstName?.toLowerCase() ?? '',
        user.status?.toLowerCase() ?? '',
        user.roles?.map(role => role.name).join(' ').toLowerCase(),
        createdOnFormatted.toLowerCase()
      ];

      return searchFields.some(field => field?.includes(query));
    });
  }


  getRoleNames(user: User): string {
    return user.roles?.map(role => role.name).join(', ') || 'No roles';
  }

  async onDelete(user: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Подтверждение удаления',
      html: `Вы действительно хотите удалить пользователя <b>${user.login}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d63',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Да, удалить!',
      cancelButtonText: 'Отменить',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    });

    if (result.isConfirmed) {
      try {
        await this.userService.deleteUser(user.id);
        this.loadUsers();
        Swal.fire(
          'Удалено!',
          'Пользователь успешно удален.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Ошибка!',
          'Не удалось удалить пользователя.',
          'error'
        );
        console.error('Ошибка при удалении:', error);
      }
    }
  }





}

