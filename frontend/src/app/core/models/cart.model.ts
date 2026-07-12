export interface CartItemOption {
  readonly itemId: string;
  readonly groupId: string;
  readonly groupName: string;
  readonly name: string;
  readonly extraPrice: number;
}

export interface CartItem {
  readonly cartItemId: string;
  readonly productId: string;
  readonly name: string;
  readonly slug: string;
  readonly categorySlug: string;
  readonly thumbnailUrl: string | null;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly itemTotal: number;
  readonly optionItemIds: readonly string[];
  readonly options: readonly CartItemOption[];
}

export interface CartResponse {
  readonly items: readonly CartItem[];
  readonly subtotal: number;
  readonly totalQuantity: number;
}

export interface AddCartItemRequest {
  readonly product_id: string;
  readonly quantity: number;
  readonly option_item_ids: readonly string[];
  readonly force_new?: boolean;
}

export interface UpdateCartItemRequest {
  readonly quantity: number;
}
