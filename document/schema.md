# Data Model Schema — WeBee Bakery

> Audit Date: 2026-06-27  
> Source of Truth: Prisma ERD (`document/erd.md`) & Zod Schemas (`backend/src/modules/*.schema.ts`)

---

## Confirmed Backend Schemas

### 1. User & Profile (`users`, `addresses`)
```typescript
interface User {
  userId: string;          // UUID
  fullName: string;
  email: string | null;    // Nullable if registered via phone
  phone: string | null;    // Nullable if registered via social/email
  role: 'member' | 'admin';
  loyaltyPoints: number;   // Default 0
  membershipTier: 'member' | 'bronze' | 'silver' | 'gold' | 'diamond';
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Address {
  addressId: string;       // UUID
  userId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}
```

### 2. Product & Options (`products`, `categories`, `option_groups`, `option_items`)
```typescript
interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  // ⚠️ CONFLICT/GAP: No `isFeatured` boolean field exists in backend.
}

interface Product {
  productId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;       // Decimal mapped to number
  thumbnailUrl: string | null;
  isCustomizable: boolean; // True for custom cake builder or cakes with sizing
  isActive: boolean;
  avgRating: number;       // Default 0.00
  reviewCount: number;     // Default 0
  // ⚠️ CONFLICT/GAP: No `soldCount` field exists in backend table.
}

interface OptionGroup {
  groupId: string;
  name: string;            // e.g. "Kích thước", "Cốt bánh"
  isRequired: boolean;
  isMultiple: boolean;
  items: OptionItem[];
}

interface OptionItem {
  itemId: string;
  groupId: string;
  name: string;
  extraPrice: number;      // Added to basePrice
}
```

### 3. Cart (`cart` stored in Redis)
```typescript
interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  totalQuantity: number;
}

interface CartItemResponse {
  cartItemId: string;
  productId: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  unitPrice: number;       // Base + options total
  quantity: number;
  itemTotal: number;
  options: {
    name: string;
    extraPrice: number;
  }[];
  // ⚠️ CONFLICT/GAP: No item-level `note` field exists in Redis cart item schema.
}
```

### 4. Order (`orders`, `order_items`)
```typescript
interface OrderCreateInput {
  recipientName: string;
  email?: string;          // Optional
  phone: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress?: string;// Required if delivery. MUST be a single string.
  deliveryDate: string;    // REQUIRED: YYYY-MM-DD
  deliveryTimeSlot: string;// REQUIRED: e.g. "08:00-10:00"
  paymentMethod: 'transfer' | 'cod'; // BẮT BUỘC có 'cod' trên UI, yêu cầu Backend cập nhật schema (`TODO_BACKEND`)
  couponCode?: string;
  note?: string;           // Order-level note
  // ⚠️ CONFLICT/GAP: No `invoiceInfo` fields exist in backend schema.
}

interface OrderResponse {
  orderId: string;
  userId: string | null;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'transfer' | 'cod';
  subtotal: number;
  shippingFee: number;     // Always 0
  discountAmount: number;
  totalAmount: number;
  recipientName: string;
  phone: string;
  deliveryAddress: string | null;
  deliveryDate: string;
  deliveryTimeSlot: string;
  note: string | null;
  paymentQrUrl?: string;   // Generated for bank transfer
  transferContent?: string;// Reference code e.g. "DH123456"
  createdAt: string;
}
```

---

## Schema Conflicts & Resolutions for Frontend

1. **Address Splitting**: Frontend UI has 3 fields (Province, District, Ward), but schema accepts 1 string `deliveryAddress`. Combine before submitting.
2. **Missing `soldCount`**: Giữ nguyên UI section bán chạy, chờ Backend bổ sung trường (`TODO_BACKEND`).
3. **Missing Item Note**: Giữ nguyên UI trường ghi chú từng bánh, yêu cầu Backend lưu cấu trúc item note (`TODO_BACKEND`).
4. **Missing Invoice Info**: Giữ nguyên UI form yêu cầu hóa đơn, yêu cầu Backend bổ sung trường hóa đơn (`TODO_BACKEND`).
5. **Missing COD**: Giữ nguyên lựa chọn COD trên màn hình thanh toán, yêu cầu Backend bổ sung `cod` vào enum Zod schema (`TODO_BACKEND`).
