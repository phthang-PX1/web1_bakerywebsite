import { Injectable, signal } from '@angular/core';

import type { CakeMessage, CakeMessageTemplate } from '../models/cake-message.model';
import type { CartItem } from '../models/cart.model';

/** Categories whose cakes ship with a printable greeting card. */
const ELIGIBLE_CATEGORY_SLUGS = new Set(['banh-gato', 'banh-entremet']);

const STORAGE_KEY = 'webee_cake_messages';
const SESSION_SKIP_KEY = 'webee_cake_message_skipped';

export const CAKE_MESSAGE_MAX_LENGTH = 60;

/** Greeting-card designs. Fonts are loaded in index.html (Vietnamese subsets). */
export const CAKE_MESSAGE_TEMPLATES: readonly CakeMessageTemplate[] = [
  {
    id: 'classic',
    name: 'Tem Cổ điển',
    sizeLabel: '28×32mm',
    background: '#fffbec',
    ink: '#8a5a2b',
    fontFamily: '"Patrick Hand", "Segoe Print", cursive',
    fontSize: '1.5rem',
    decor: 'none',
  },
  {
    id: 'sweet',
    name: 'Thiệp Ngọt ngào',
    sizeLabel: '28×32mm',
    background: 'linear-gradient(160deg, #fdeef2 0%, #fbe3e9 100%)',
    ink: '#b34a66',
    fontFamily: '"Caveat", "Segoe Script", cursive',
    fontSize: '1.75rem',
    decor: 'hearts',
  },
  {
    id: 'party',
    name: 'Tem Sinh nhật',
    sizeLabel: '28×32mm',
    background: '#fff6d9',
    ink: '#b06a10',
    fontFamily: '"Patrick Hand", "Segoe Print", cursive',
    fontSize: '1.5rem',
    decor: 'confetti',
  },
  {
    id: 'luxe',
    name: 'Thiệp Sang trọng',
    sizeLabel: '28×32mm',
    background: 'linear-gradient(160deg, #3a2417 0%, #2b1a0f 100%)',
    ink: '#ecc373',
    fontFamily: '"Dancing Script", "Segoe Script", cursive',
    fontSize: '1.75rem',
    decor: 'gold',
  },
];

/**
 * Holds greeting-card messages attached to cart lines.
 *
 * Messages live in localStorage (the cart itself is server-side, so ids stay
 * valid across reloads); the "don't ask again" flag lives in sessionStorage
 * so the order prompt returns in a fresh browsing session.
 */
@Injectable({ providedIn: 'root' })
export class CakeMessageService {
  readonly messages = signal<Record<string, CakeMessage>>(this.load());

  readonly templates = CAKE_MESSAGE_TEMPLATES;

  templateById(id: string): CakeMessageTemplate {
    return this.templates.find((t) => t.id === id) ?? this.templates[0];
  }

  isEligible(item: CartItem): boolean {
    return ELIGIBLE_CATEGORY_SLUGS.has(item.categorySlug);
  }

  messageFor(cartItemId: string): CakeMessage | null {
    return this.messages()[cartItemId] ?? null;
  }

  /** Eligible items that don't have a message yet — the order-prompt queue. */
  pendingItems(items: readonly CartItem[]): CartItem[] {
    return items.filter((item) => this.isEligible(item) && !this.messageFor(item.cartItemId));
  }

  save(message: CakeMessage): void {
    this.messages.update((all) => ({ ...all, [message.cartItemId]: message }));
    this.persist();
  }

  remove(cartItemId: string): void {
    this.messages.update((all) => {
      const { [cartItemId]: _removed, ...rest } = all;
      return rest;
    });
    this.persist();
  }

  /** Drop messages for cart lines that no longer exist. */
  prune(validCartItemIds: readonly string[]): void {
    const valid = new Set(validCartItemIds);
    const all = this.messages();
    const kept = Object.values(all).filter((m) => valid.has(m.cartItemId));
    if (kept.length !== Object.keys(all).length) {
      this.messages.set(Object.fromEntries(kept.map((m) => [m.cartItemId, m])));
      this.persist();
    }
  }

  clearAll(): void {
    this.messages.set({});
    this.persist();
  }

  get skippedThisSession(): boolean {
    try {
      return sessionStorage.getItem(SESSION_SKIP_KEY) === '1';
    } catch {
      return false;
    }
  }

  markSkippedThisSession(): void {
    try {
      sessionStorage.setItem(SESSION_SKIP_KEY, '1');
    } catch {
      /* storage unavailable — prompt will simply reappear */
    }
  }

  private load(): Record<string, CakeMessage> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    } catch {
      /* storage unavailable — messages stay in memory for the session */
    }
  }
}
