import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {UsersComponent} from './users.component';
import {UserService} from '../service/user/user.service';
import {RoleService} from '../service/role/role.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import Swal from 'sweetalert2';

describe('Тестовый сценарий: Управление пользователями (Администратор)', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', ['getUsers', 'createUser', 'updateUser', 'deleteUser']);
    const roleSpy = jasmine.createSpyObj('RoleService', ['getRoles']);
    await TestBed.configureTestingModule({
      imports: [UsersComponent, FormsModule, CommonModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: RoleService, useValue: roleSpy },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
  });

  describe('1. Загрузка данных', () => {
    it('Загружает пользователей и роли', async () => {
      userServiceSpy.getUsers.and.returnValue(Promise.resolve([{ login: 'admin' }]));
      roleServiceSpy.getRoles.and.returnValue(Promise.resolve([{ id: 1, name: 'Admin' }]));
      await component.ngOnInit();
      expect(userServiceSpy.getUsers).toHaveBeenCalled();
      expect(roleServiceSpy.getRoles).toHaveBeenCalled();
      expect(component.users.length).toBe(1);
      expect(component.availableRoles.length).toBe(1);
    });
  });

  describe('2. Управление пользователями', () => {
    it('Создает нового пользователя', fakeAsync(() => {
      userServiceSpy.createUser.and.returnValue(Promise.resolve({}));
      userServiceSpy.getUsers.and.returnValue(Promise.resolve([]));
      component.onAddUser();
      component.selectedUser.login = 'newuser';
      component.onSaveUser();
      tick();
      expect(userServiceSpy.createUser).toHaveBeenCalledWith(jasmine.objectContaining({ login: 'newuser' }));
    }));

    it('Редактирует пользователя', fakeAsync(() => {
      userServiceSpy.updateUser.and.returnValue(Promise.resolve({}));
      userServiceSpy.getUsers.and.returnValue(Promise.resolve([]));
      component.selectedUser = { id: 1, login: 'edituser', firstName: '', lastName: '', status: '', roles: [], password: '' };
      component.isEditing = true;
      component.onSaveUser();
      tick();
      expect(userServiceSpy.updateUser).toHaveBeenCalledWith(jasmine.objectContaining({ login: 'edituser' }));
    }));

    it('Удаляет пользователя', fakeAsync(() => {
      userServiceSpy.deleteUser.and.returnValue(Promise.resolve());
      userServiceSpy.getUsers.and.returnValue(Promise.resolve([]));
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
      spyOn<any>(component, 'loadUsers').and.returnValue(Promise.resolve());
      component.onDelete({ id: 1, login: 'deleteuser' });
      tick();
      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(1);
    }));
  });
});
