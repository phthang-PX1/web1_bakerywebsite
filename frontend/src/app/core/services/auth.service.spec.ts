import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthApi } from '../api/auth.api';
import { UsersApi } from '../api/users.api';
import { AUTH_STORAGE_KEYS } from '../constants/app.constants';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: jasmine.SpyObj<AuthApi>;
  let usersApiMock: jasmine.SpyObj<UsersApi>;

  beforeEach(() => {
    authApiMock = jasmine.createSpyObj('AuthApi', ['login', 'register', 'logout']);
    usersApiMock = jasmine.createSpyObj('UsersApi', ['getProfile']);
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        { provide: AuthApi, useValue: authApiMock },
        { provide: UsersApi, useValue: usersApiMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should store tokens and set current user on login', () => {
    const mockResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      user: { userId: '1', email: 'test@webee.vn', fullName: 'Test User', role: 'member' }
    } as any;

    authApiMock.login.and.returnValue(of(mockResponse));

    service.login({ email: 'test@webee.vn', password: 'password' }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    expect(service.accessToken).toBe('access-token-123');
    expect(service.refreshToken).toBe('refresh-token-123');
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.currentUser$.value?.email).toBe('test@webee.vn');
    expect(service.isAdmin()).toBeFalse();
  });

  it('should clear tokens on logout', () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'access-token');
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');
    authApiMock.logout.and.returnValue(of(null as any));

    service.logout();

    expect(authApiMock.logout).toHaveBeenCalledWith('refresh-token');
    expect(service.accessToken).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.currentUser$.value).toBeNull();
  });
});
