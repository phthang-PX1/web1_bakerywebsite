import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

describe('App', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let cartServiceMock: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['init']);
    cartServiceMock = jasmine.createSpyObj('CartService', ['loadCart']);
    cartServiceMock.loadCart.and.returnValue(of({ items: [], totalAmount: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app and initialize auth & cart services', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    fixture.detectChanges();
    expect(authServiceMock.init).toHaveBeenCalled();
    expect(cartServiceMock.loadCart).toHaveBeenCalled();
  });
});
