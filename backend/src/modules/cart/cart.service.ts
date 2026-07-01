import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { AppError } from "../../middlewares/errorHandler";
import type {
  CartIdentity,
  CartItemInput,
  CartItemResponse,
  CartOptionSnapshot,
  CartResponse,
  StoredCart,
  StoredCartItem,
  UpdateCartItemInput
} from "./cart.types";

const CART_TTL_SECONDS = 7 * 24 * 60 * 60;

type ProductWithOptions = {
  productId: string;
  name: string;
  slug: string;
  basePrice: Prisma.Decimal;
  thumbnailUrl: string | null;
  optionGroups: {
    groupId: string;
    name: string;
    isRequired: boolean;
    isMultiple: boolean;
    items: {
      itemId: string;
      groupId: string;
      name: string;
      extraPrice: Prisma.Decimal;
    }[];
  }[];
};

const emptyCart = (): CartResponse => ({
  items: [],
  subtotal: 0,
  totalQuantity: 0
});

const createStoredCart = (items: StoredCartItem[] = []): StoredCart => ({
  items,
  updatedAt: new Date().toISOString()
});

const getCartKey = (identity: CartIdentity) =>
  identity.type === "user"
    ? `cart:user:${identity.id}`
    : `cart:session:${identity.id}`;

const toMoney = (value: Prisma.Decimal | number) =>
  Number(Number(value).toFixed(2));

const sortOptionIds = (optionItemIds: string[]) => [...optionItemIds].sort();

const getItemSignature = (productId: string, optionItemIds: string[]) =>
  `${productId}:${sortOptionIds(optionItemIds).join(",")}`;

const assertNoDuplicateOptions = (optionItemIds: string[]) => {
  if (new Set(optionItemIds).size !== optionItemIds.length) {
    throw new AppError(400, "option_item_ids must not contain duplicates");
  }
};

const parseStoredCart = (rawCart: string | null): StoredCart => {
  if (!rawCart) return createStoredCart();

  try {
    const parsed = JSON.parse(rawCart) as Partial<StoredCart>;

    if (!Array.isArray(parsed.items)) {
      return createStoredCart();
    }

    return {
      items: parsed.items.filter((item): item is StoredCartItem => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof item.cartItemId === "string" &&
          typeof item.productId === "string" &&
          typeof item.quantity === "number" &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          Array.isArray(item.optionItemIds) &&
          item.optionItemIds.every((id) => typeof id === "string") &&
          typeof item.addedAt === "string"
        );
      }),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString()
    };
  } catch {
    return createStoredCart();
  }
};

const readStoredCart = async (identity: CartIdentity) => {
  const cartKey = getCartKey(identity);
  const cart = parseStoredCart(await redis.get(cartKey));

  return { cartKey, cart };
};

const saveStoredCartByKey = async (cartKey: string, cart: StoredCart) => {
  if (cart.items.length === 0) {
    await redis.del(cartKey);
    return;
  }

  await redis.set(cartKey, JSON.stringify(cart), "EX", CART_TTL_SECONDS);
};

const getActiveProducts = async (productIds: string[]) => {
  if (productIds.length === 0) return new Map<string, ProductWithOptions>();

  const products = await prisma.product.findMany({
    where: {
      productId: { in: productIds },
      isActive: true,
      category: { isActive: true }
    },
    select: {
      productId: true,
      name: true,
      slug: true,
      basePrice: true,
      thumbnailUrl: true,
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        select: {
          groupId: true,
          name: true,
          isRequired: true,
          isMultiple: true,
          items: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
              itemId: true,
              groupId: true,
              name: true,
              extraPrice: true
            }
          }
        }
      }
    }
  });

  return new Map(products.map((product) => [product.productId, product]));
};

const getActiveProduct = async (productId: string) => {
  const products = await getActiveProducts([productId]);
  const product = products.get(productId);

  if (!product) {
    throw new AppError(404, "Product not found or inactive");
  }

  return product;
};

const validateProductOptions = (
  product: ProductWithOptions,
  optionItemIds: string[]
) => {
  assertNoDuplicateOptions(optionItemIds);

  const selectedOptionIds = sortOptionIds(optionItemIds);
  const activeItemsById = new Map(
    product.optionGroups.flatMap((group) =>
      group.items.map((item) => [item.itemId, { group, item }] as const)
    )
  );
  const selectedByGroup = new Map<string, typeof activeItemsById extends Map<string, infer T> ? T[] : never>();
  const selectedOptions: CartOptionSnapshot[] = [];

  for (const itemId of selectedOptionIds) {
    const match = activeItemsById.get(itemId);

    if (!match) {
      throw new AppError(400, "Option item is not available for this product");
    }

    const currentGroupItems = selectedByGroup.get(match.group.groupId) ?? [];
    currentGroupItems.push(match);
    selectedByGroup.set(match.group.groupId, currentGroupItems);
    selectedOptions.push({
      itemId: match.item.itemId,
      groupId: match.group.groupId,
      groupName: match.group.name,
      name: match.item.name,
      extraPrice: toMoney(match.item.extraPrice)
    });
  }

  for (const group of product.optionGroups) {
    const selectedInGroup = selectedByGroup.get(group.groupId) ?? [];

    if (group.isRequired && selectedInGroup.length === 0) {
      throw new AppError(400, `Option group "${group.name}" is required`);
    }

    if (!group.isMultiple && selectedInGroup.length > 1) {
      throw new AppError(400, `Option group "${group.name}" allows only one item`);
    }
  }

  return {
    optionItemIds: selectedOptionIds,
    selectedOptions
  };
};

const buildCartItemResponse = (
  item: StoredCartItem,
  product: ProductWithOptions,
  options: CartOptionSnapshot[]
): CartItemResponse => {
  const unitPrice = toMoney(
    toMoney(product.basePrice) +
      options.reduce((sum, option) => sum + option.extraPrice, 0)
  );
  const itemTotal = toMoney(unitPrice * item.quantity);

  return {
    cartItemId: item.cartItemId,
    product: {
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      basePrice: toMoney(product.basePrice),
      thumbnailUrl: product.thumbnailUrl
    },
    productId: product.productId,
    name: product.name,
    slug: product.slug,
    thumbnailUrl: product.thumbnailUrl,
    quantity: item.quantity,
    optionItemIds: item.optionItemIds,
    options,
    unitPrice,
    itemTotal,
    addedAt: item.addedAt
  };
};

const resolveCart = async (storedCart: StoredCart) => {
  const productIds = Array.from(new Set(storedCart.items.map((item) => item.productId)));
  const productsById = await getActiveProducts(productIds);
  const validStoredItems: StoredCartItem[] = [];
  const responseItems: CartItemResponse[] = [];

  for (const item of storedCart.items) {
    const product = productsById.get(item.productId);

    if (!product) continue;

    try {
      const { optionItemIds, selectedOptions } = validateProductOptions(
        product,
        item.optionItemIds
      );
      const normalizedItem = {
        ...item,
        optionItemIds
      };

      validStoredItems.push(normalizedItem);
      responseItems.push(buildCartItemResponse(normalizedItem, product, selectedOptions));
    } catch (error) {
      if (error instanceof AppError) continue;
      throw error;
    }
  }

  return {
    storedCart: createStoredCart(validStoredItems),
    response: {
      items: responseItems,
      subtotal: toMoney(responseItems.reduce((sum, item) => sum + item.itemTotal, 0)),
      totalQuantity: responseItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  };
};

const persistResolvedCart = async (cartKey: string, storedCart: StoredCart) => {
  const resolved = await resolveCart(storedCart);
  await saveStoredCartByKey(cartKey, resolved.storedCart);
  return resolved.response;
};

export const getCart = async (identity: CartIdentity) => {
  const { cartKey, cart } = await readStoredCart(identity);
  return persistResolvedCart(cartKey, cart);
};

export const addCartItem = async (
  identity: CartIdentity,
  input: CartItemInput
) => {
  const product = await getActiveProduct(input.productId);
  const { optionItemIds } = validateProductOptions(product, input.optionItemIds);
  const { cartKey, cart } = await readStoredCart(identity);
  const signature = getItemSignature(input.productId, optionItemIds);
  const existingItem = cart.items.find(
    (item) => getItemSignature(item.productId, item.optionItemIds) === signature
  );

  if (existingItem) {
    const nextQuantity = existingItem.quantity + input.quantity;

    if (nextQuantity > 99) {
      throw new AppError(400, "Cart item quantity cannot exceed 99");
    }

    existingItem.quantity = nextQuantity;
  } else {
    cart.items.push({
      cartItemId: randomUUID(),
      productId: input.productId,
      quantity: input.quantity,
      optionItemIds,
      addedAt: new Date().toISOString()
    });
  }

  return persistResolvedCart(cartKey, createStoredCart(cart.items));
};

export const updateCartItem = async (
  identity: CartIdentity,
  cartItemId: string,
  input: UpdateCartItemInput
) => {
  const { cartKey, cart } = await readStoredCart(identity);
  const item = cart.items.find((cartItem) => cartItem.cartItemId === cartItemId);

  if (!item) {
    throw new AppError(404, "Cart item not found");
  }

  item.quantity = input.quantity;

  return persistResolvedCart(cartKey, createStoredCart(cart.items));
};

export const removeCartItem = async (
  identity: CartIdentity,
  cartItemId: string
) => {
  const { cartKey, cart } = await readStoredCart(identity);
  const nextItems = cart.items.filter((item) => item.cartItemId !== cartItemId);

  if (nextItems.length === cart.items.length) {
    throw new AppError(404, "Cart item not found");
  }

  return persistResolvedCart(cartKey, createStoredCart(nextItems));
};

export const clearCart = async (identity: CartIdentity) => {
  await redis.del(getCartKey(identity));
  return emptyCart();
};

export const mergeGuestCartIntoUserCart = async (
  userId: string,
  sessionId: string | undefined
) => {
  const userIdentity: CartIdentity = { type: "user", id: userId };
  const userKey = getCartKey(userIdentity);

  if (!sessionId) {
    return getCart(userIdentity);
  }

  const sessionKey = getCartKey({ type: "session", id: sessionId });
  const [userCartRaw, guestCartRaw] = await Promise.all([
    redis.get(userKey),
    redis.get(sessionKey)
  ]);
  const userCart = parseStoredCart(userCartRaw);
  const guestCart = parseStoredCart(guestCartRaw);
  const mergedItems = [...userCart.items];

  for (const guestItem of guestCart.items) {
    const signature = getItemSignature(guestItem.productId, guestItem.optionItemIds);
    const existingItem = mergedItems.find(
      (item) => getItemSignature(item.productId, item.optionItemIds) === signature
    );

    if (existingItem) {
      existingItem.quantity = Math.min(99, existingItem.quantity + guestItem.quantity);
      continue;
    }

    mergedItems.push(guestItem);
  }

  const response = await persistResolvedCart(userKey, createStoredCart(mergedItems));
  await redis.del(sessionKey);

  return response;
};
