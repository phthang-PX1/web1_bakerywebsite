import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartService } from './cart.service';
import { CartApi } from '../api/cart.api';
import { AuthService } from './auth.service';

describe('CartService', () => {
  let service: CartService;
  let cartApiMock: jasmine.SpyObj<CartApi>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    cartApiMock = jasmine.createSpyObj('CartApi', ['getCart', 'addItem', 'removeItem', 'clearCart']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn'], { currentUser$: of(null) });

    const emptyCart = { items: [], totalAmount: 0, subtotal: 0, totalItems: 0 };
    cartApiMock.getCart.and.returnValue(of(emptyCart as any));

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: CartApi, useValue: cartApiMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(CartService);
  });

  it('should be created and load cart initially', () => {
    expect(service).toBeTruthy();
    service.loadCart().subscribe((cart) => {
      expect(cart.items.length).toBe(0);
    });
  });

  it('should update cart subject when adding an item', () => {
    const updatedCart = {
      items: [{ cartItemId: 'item-1', product: { name: 'Croissant' }, quantity: 1 }],
      totalAmount: 35000,
      subtotal: 35000,
      totalItems: 1
    };
    cartApiMock.addItem.and.returnValue(of(updatedCart as any));

    service.addItem({ productId: 'prod-1', quantity: 1 }).subscribe((cart) => {
      expect(cart.totalItems).toBe(1);
    });

    expect(service.cartSubject.value?.totalItems).toBe(1);
  });
});
