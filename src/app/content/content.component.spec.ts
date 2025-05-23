import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ContentComponent} from './content.component';
import {AxiosService} from '../service/axios/axios.service';

describe('Тестовый сценарий: Авторизация пользователя', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;
  let axiosServiceSpy: jasmine.SpyObj<AxiosService>;

  beforeEach(async () => {
    const axiosSpy = jasmine.createSpyObj('AxiosService', ['request', 'setAuthToken']);
    await TestBed.configureTestingModule({
      imports: [ContentComponent],
      providers: [{ provide: AxiosService, useValue: axiosSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    axiosServiceSpy = TestBed.inject(AxiosService) as jasmine.SpyObj<AxiosService>;
  });

  it('1. Успешная авторизация администратора', fakeAsync(() => {
    axiosServiceSpy.request.and.returnValue(Promise.resolve({
      data: { token: 'admintoken', roles: [{ name: 'admin' }] }
    }));

    component.onLogin({ login: 'admin', password: 'adminpass' });
    tick();

    expect(axiosServiceSpy.request).toHaveBeenCalledWith('POST', '/login', { login: 'admin', password: 'adminpass' });
    expect(axiosServiceSpy.setAuthToken).toHaveBeenCalledWith('admintoken');
    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toBe('admin');
  }));

  it('2. Ошибка неверного пароля', fakeAsync(() => {
    axiosServiceSpy.request.and.returnValue(Promise.reject({ response: { status: 401, data: { message: 'Неверный пароль' } } }));

    component.onLogin({ login: 'admin', password: 'wrongpass' });
    tick();

    expect(axiosServiceSpy.request).toHaveBeenCalledWith('POST', '/login', { login: 'admin', password: 'wrongpass' });
    expect(component.isLoggedIn).toBeFalse();
  }));

  it('3. Ошибка: пользователь не найден', fakeAsync(() => {
    axiosServiceSpy.request.and.returnValue(Promise.reject({ response: { status: 404, data: { message: 'Пользователь не найден' } } }));

    component.onLogin({ login: 'unknownuser', password: 'pass123' });
    tick();

    expect(axiosServiceSpy.request).toHaveBeenCalledWith('POST', '/login', { login: 'unknownuser', password: 'pass123' });
    expect(component.isLoggedIn).toBeFalse();
  }));

  it('4. Ошибка: пустой логин', fakeAsync(() => {
    component.onLogin({ login: '', password: 'dispatchpass' });
    expect(component.isLoggedIn).toBeFalse();
  }));

  it('5. Ошибка: пустой пароль', fakeAsync(() => {
    component.onLogin({ login: 'engineer', password: '' });
    expect(component.isLoggedIn).toBeFalse();
  }));

  it('6. Успешная авторизация диспетчера', fakeAsync(() => {
    axiosServiceSpy.request.and.returnValue(Promise.resolve({
      data: { token: 'dispatchtoken', roles: [{ name: 'dispatcher' }] }
    }));

    component.onLogin({ login: 'dispatcher', password: 'dispatchpass' });
    tick();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toBe('user');
  }));

  it('7. Успешная авторизация инженера', fakeAsync(() => {
    axiosServiceSpy.request.and.returnValue(Promise.resolve({
      data: { token: 'engineertoken', roles: [{ name: 'engineer' }] }
    }));

    component.onLogin({ login: 'engineer', password: 'engineerpass' });
    tick();

    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toBe('user');
  }));
});
