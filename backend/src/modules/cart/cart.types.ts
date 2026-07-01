export type CartIdentity =
  | {
      type: "user";
      id: string;
    }
  | {
      type: "session";
      id: string;
    };

export type CartItemInput = {
  productId: string;
  quantity: number;
  optionItemIds: string[];
};

export type UpdateCartItemInput = {
  quantity: number;
};

export type StoredCartItem = {
  cartItemId: string;
  productId: string;
  quantity: number;
  optionItemIds: string[];
  addedAt: string;
};

export type StoredCart = {
  items: StoredCartItem[];
  updatedAt: string;
};

export type CartProductSnapshot = {
  productId: string;
  name: string;
  slug: string;
  basePrice: number;
  thumbnailUrl: string | null;
};

export type CartOptionSnapshot = {
  itemId: string;
  groupId: string;
  groupName: string;
  name: string;
  extraPrice: number;
};

export type CartItemResponse = {
  cartItemId: string;
  product: CartProductSnapshot;
  // Flat fields mirrored at top level for frontend CartItem compatibility
  productId: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  quantity: number;
  optionItemIds: string[];
  options: CartOptionSnapshot[];
  unitPrice: number;
  itemTotal: number;
  addedAt: string;
};

export type CartResponse = {
  items: CartItemResponse[];
  subtotal: number;
  totalQuantity: number;
};
