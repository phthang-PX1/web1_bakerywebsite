import { Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CAKE_MESSAGE_MAX_LENGTH,
  CakeMessageService,
} from '../../../core/services/cake-message.service';
import type { CakeMessageTemplate } from '../../../core/models/cake-message.model';
import type { CartItem } from '../../../core/models/cart.model';

export type CakeMessageDialogResult = 'completed' | 'skipped' | 'dismissed';

type Step = 'prompt' | 'template' | 'editor';

/**
 * Three-step greeting-card flow for cakes:
 * prompt ("this cake can carry a message") → template picker → live-preview editor.
 * Feed it the queue of eligible cart items; it walks through them one by one.
 */
@Component({
  selector: 'app-cake-message-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open() && currentItem(); as item) {
      <div class="overlay" (click)="finished.emit('dismissed')">
        <div class="dialog" (click)="$event.stopPropagation()" role="dialog" aria-label="Lời chúc trên bánh">

          <!-- ====== Step 1: prompt ====== -->
          @if (step() === 'prompt') {
            <header class="dialog__head">
              <span class="dialog__icon dialog__icon--pen">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 3.5a2.1 2.1 0 0 1 3 3L8.5 18 4 19l1-4.5z"/>
                </svg>
              </span>
              <h3 class="dialog__title">Lời chúc trên bánh</h3>
              <button class="dialog__close" type="button" aria-label="Đóng" (click)="finished.emit('dismissed')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </header>
            <p class="dialog__body">
              "{{ item.name }}" có thể thêm lời chúc trên bánh. Bạn muốn thêm không?
            </p>
            <div class="dialog__actions">
              <button class="btn-ghost" type="button" (click)="skip()">Bỏ qua</button>
              <button class="btn-primary" type="button" (click)="step.set('template')">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 3.5a2.1 2.1 0 0 1 3 3L8.5 18 4 19l1-4.5z"/>
                </svg>
                Thêm lời chúc
              </button>
            </div>
          }

          <!-- ====== Step 2: template picker ====== -->
          @if (step() === 'template') {
            <header class="dialog__head">
              <span class="dialog__icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 3.5h8.5L19 7v13.5H7z"/><path d="M15 3.5V7h3.5M9.8 12h4.4M9.8 15.5h4.4"/>
                </svg>
              </span>
              <div class="dialog__head-text">
                <h3 class="dialog__title">Chọn mẫu lời chúc</h3>
                <p class="dialog__subtitle">{{ item.name }}</p>
              </div>
              <button class="dialog__close" type="button" aria-label="Đóng" (click)="finished.emit('dismissed')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </header>

            <div class="template-list">
              @for (tpl of service.templates; track tpl.id) {
                <button class="template-row" type="button" (click)="chooseTemplate(tpl)">
                  <span class="template-row__swatch" [style.background]="tpl.background">
                    <span [style.color]="tpl.ink" [style.font-family]="tpl.fontFamily">Aa</span>
                  </span>
                  <span class="template-row__meta">
                    <strong>{{ tpl.name }}</strong>
                    <small>1 nội dung có thể nhập <em>{{ tpl.sizeLabel }}</em></small>
                  </span>
                  <svg class="template-row__arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
                </button>
              }
            </div>
          }

          <!-- ====== Step 3: editor with live preview ====== -->
          @if (step() === 'editor' && selectedTemplate(); as tpl) {
            <header class="dialog__head">
              <span class="dialog__icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M7 3.5h8.5L19 7v13.5H7z"/><path d="M15 3.5V7h3.5M9.8 12h4.4M9.8 15.5h4.4"/>
                </svg>
              </span>
              <div class="dialog__head-text">
                <h3 class="dialog__title">Thiết kế lời chúc trên bánh</h3>
                <p class="dialog__subtitle">{{ item.name }} · {{ tpl.name }}</p>
              </div>
              <button class="dialog__close" type="button" aria-label="Đóng" (click)="finished.emit('dismissed')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </header>

            <div class="preview-label">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Xem trước</span>
              <small>{{ tpl.sizeLabel }}</small>
              <button class="preview-label__back" type="button" (click)="step.set('template')">Đổi mẫu</button>
            </div>

            <div class="preview-card" [style.background]="tpl.background" [class]="'preview-card preview-card--' + tpl.decor">
              @if (tpl.decor === 'hearts') {
                <span class="decor decor--tl">♥</span><span class="decor decor--tr">♥</span>
                <span class="decor decor--bl">♥</span><span class="decor decor--br">♥</span>
              }
              @if (tpl.decor === 'confetti') {
                <span class="decor decor--tl">✦</span><span class="decor decor--tr">●</span>
                <span class="decor decor--bl">●</span><span class="decor decor--br">✦</span>
              }
              @if (tpl.decor === 'gold') {
                <span class="preview-card__frame" [style.border-color]="tpl.ink"></span>
              }
              <span
                class="preview-card__text"
                [class.preview-card__text--empty]="!text().trim()"
                [style.color]="tpl.ink"
                [style.font-family]="tpl.fontFamily"
                [style.font-size]="tpl.fontSize"
              >{{ text().trim() || 'Lời chúc của bạn…' }}</span>
            </div>

            <label class="editor-label" for="cake-message-input">
              <span class="editor-label__t">T</span> Nhập nội dung
            </label>
            <p class="editor-hint">Ví dụ: Bạn ơi ? Hôm nay đã ăn bánh chưaaa?</p>
            <input
              id="cake-message-input"
              class="editor-input"
              type="text"
              [maxlength]="maxLength"
              [ngModel]="text()"
              (ngModelChange)="text.set($event)"
              autocomplete="off"
            />
            <div class="editor-counter">{{ text().trim().length }}/{{ maxLength }}</div>

            <button class="btn-primary btn-primary--full" type="button" [disabled]="!text().trim()" (click)="save(item, tpl)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Lưu lời chúc
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .overlay {
      position: fixed; inset: 0; background: rgba(43, 26, 15, 0.45); z-index: 9000;
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .dialog {
      background: t.$surface; border: 1px solid t.$border; border-radius: t.$r-sm;
      padding: t.$sp-5 t.$sp-5 t.$sp-5; max-width: 420px; width: 100%;
      box-shadow: t.$shadow-lift; max-height: 92vh; overflow-y: auto;
    }

    .dialog__head { display: flex; align-items: flex-start; gap: t.$sp-3; margin-bottom: t.$sp-4; }
    .dialog__head-text { flex: 1; min-width: 0; }
    .dialog__icon {
      flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 8px; background: t.$surface-warm; color: t.$caramel;
    }
    .dialog__icon--pen { color: t.$primary; }
    .dialog__title {
      flex: 1; font-family: t.$font-display; font-size: 1.25rem; font-weight: 550;
      color: t.$ink; margin: 0; line-height: 34px;
    }
    .dialog__head-text .dialog__title { line-height: 1.3; }
    .dialog__subtitle { font-size: t.$fs-micro; color: t.$muted; margin: 2px 0 0; }
    .dialog__close {
      flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border: none; background: none; color: t.$muted; cursor: pointer;
      &:hover { color: t.$ink; }
    }

    .dialog__body { font-size: t.$fs-body-sm; color: t.$muted; margin: 0 0 t.$sp-5; line-height: 1.6; }
    .dialog__actions { display: flex; gap: t.$sp-3; justify-content: flex-end; }

    .btn-ghost {
      @include m.btn-base;
      padding: 10px 20px; border-radius: t.$r-pill;
      border: 1px solid t.$border; background: t.$surface; color: t.$ink;
      font-size: t.$fs-body-sm;
      &:hover { border-color: t.$primary; color: t.$primary; }
    }
    .btn-primary {
      @include m.btn-base;
      padding: 10px 20px; border-radius: t.$r-pill;
      background: t.$primary; color: #fff; font-size: t.$fs-body-sm;
      &:hover:not(:disabled) { background: t.$primary-dark; }
    }
    .btn-primary--full { width: 100%; padding: 13px 20px; }

    /* --- Template picker --------------------------------------------------- */
    .template-list { display: flex; flex-direction: column; gap: t.$sp-3; }
    .template-row {
      display: flex; align-items: center; gap: t.$sp-4; width: 100%;
      border: 1px solid t.$border; border-radius: t.$r-sm; background: t.$paper;
      padding: t.$sp-3 t.$sp-4; cursor: pointer; text-align: left;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      &:hover { border-color: t.$caramel; box-shadow: t.$shadow-soft; }
    }
    .template-row__swatch {
      flex-shrink: 0; width: 56px; height: 62px; border-radius: 8px;
      border: 1px solid rgba(43, 26, 15, 0.12);
      display: inline-flex; align-items: center; justify-content: center;
      span { font-size: 1.375rem; line-height: 1; }
    }
    .template-row__meta {
      flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;
      strong { font-size: t.$fs-body-sm; font-weight: 600; color: t.$ink; }
      small { font-size: t.$fs-micro; color: t.$muted; em { font-style: normal; color: #a99e93; margin-left: 6px; font-size: 0.75rem; } }
    }
    .template-row__arrow { color: t.$muted; flex-shrink: 0; }

    /* --- Editor ------------------------------------------------------------ */
    .preview-label {
      display: flex; align-items: center; gap: t.$sp-2; color: t.$ink;
      font-size: t.$fs-body-sm; font-weight: 600; margin-bottom: t.$sp-3;
      small { color: #a99e93; font-weight: 400; font-size: 0.75rem; }
    }
    .preview-label__back {
      margin-left: auto; border: none; background: none; cursor: pointer;
      font-size: t.$fs-micro; color: t.$primary; text-decoration: underline;
      text-underline-offset: 3px;
      &:hover { color: t.$primary-dark; }
    }

    .preview-card {
      position: relative; aspect-ratio: 28 / 32; width: 100%;
      border: 1px solid rgba(43, 26, 15, 0.12); border-radius: 10px;
      box-shadow: inset 0 1px 6px rgba(43, 26, 15, 0.06);
      display: flex; align-items: center; justify-content: center;
      padding: t.$sp-6; margin-bottom: t.$sp-5; overflow: hidden;
    }
    .preview-card__text {
      text-align: center; line-height: 1.35; overflow-wrap: anywhere; white-space: pre-wrap;
      max-width: 100%;
    }
    .preview-card__text--empty { opacity: 0.35; }
    .preview-card__frame {
      position: absolute; inset: 10px; border: 1px solid; border-radius: 6px;
      opacity: 0.55; pointer-events: none;
      &::after {
        content: ""; position: absolute; inset: 3px;
        border: 1px solid; border-color: inherit; border-radius: 4px; opacity: 0.6;
      }
    }
    .decor { position: absolute; font-size: 0.875rem; opacity: 0.5; pointer-events: none; }
    .preview-card--hearts .decor { color: #d4708b; }
    .preview-card--confetti .decor { color: #d99a2b; }
    .decor--tl { top: 10px; left: 12px; }
    .decor--tr { top: 10px; right: 12px; }
    .decor--bl { bottom: 10px; left: 12px; }
    .decor--br { bottom: 10px; right: 12px; }

    .editor-label {
      display: flex; align-items: center; gap: t.$sp-2;
      font-size: t.$fs-body-sm; font-weight: 600; color: t.$ink; margin-bottom: 4px;
    }
    .editor-label__t {
      font-family: t.$font-display; font-size: 1rem; line-height: 1; color: t.$ink;
    }
    .editor-hint { font-size: t.$fs-micro; color: #a99e93; margin: 0 0 t.$sp-2; }
    .editor-input {
      @include m.field;
      width: 100%; padding: 12px 14px; border-radius: t.$r-pill;
      border: 1.5px solid t.$success; background: t.$paper;
      &:focus { outline: none; border-color: t.$primary; }
    }
    .editor-counter {
      text-align: right; font-size: 0.6875rem; color: #a99e93; margin: 4px 2px t.$sp-4 0;
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class CakeMessageDialogComponent {
  readonly service = inject(CakeMessageService);

  readonly open = input(false);
  /** Queue of cart items to walk through (one for the edit flow). */
  readonly items = input<readonly CartItem[]>([]);
  /** 'prompt' for the order flow; 'editor' to jump straight into editing. */
  readonly startAt = input<'prompt' | 'editor'>('prompt');

  readonly finished = output<CakeMessageDialogResult>();

  readonly maxLength = CAKE_MESSAGE_MAX_LENGTH;

  readonly step = signal<Step>('prompt');
  readonly index = signal(0);
  readonly selectedTemplate = signal<CakeMessageTemplate | null>(null);
  readonly text = signal('');

  readonly currentItem = computed(() => this.items()[this.index()] ?? null);

  constructor() {
    // Re-arm internal state every time the dialog opens.
    effect(() => {
      if (!this.open()) return;
      untracked(() => this.reset());
    });
  }

  private reset(): void {
    this.index.set(0);
    const item = this.items()[0];
    const existing = item ? this.service.messageFor(item.cartItemId) : null;

    if (this.startAt() === 'editor' && existing) {
      this.selectedTemplate.set(this.service.templateById(existing.templateId));
      this.text.set(existing.text);
      this.step.set('editor');
    } else {
      this.selectedTemplate.set(null);
      this.text.set('');
      this.step.set(this.startAt() === 'editor' ? 'template' : 'prompt');
    }
  }

  skip(): void {
    this.service.markSkippedThisSession();
    this.finished.emit('skipped');
  }

  chooseTemplate(tpl: CakeMessageTemplate): void {
    this.selectedTemplate.set(tpl);
    const item = this.currentItem();
    const existing = item ? this.service.messageFor(item.cartItemId) : null;
    if (existing && !this.text().trim()) {
      this.text.set(existing.text);
    }
    this.step.set('editor');
  }

  save(item: CartItem, tpl: CakeMessageTemplate): void {
    const content = this.text().trim();
    if (!content) return;

    this.service.save({
      cartItemId: item.cartItemId,
      productName: item.name,
      templateId: tpl.id,
      text: content,
    });

    if (this.index() + 1 < this.items().length) {
      // More eligible cakes in the queue — prompt for the next one.
      this.index.update((i) => i + 1);
      this.selectedTemplate.set(null);
      this.text.set('');
      this.step.set('prompt');
    } else {
      this.finished.emit('completed');
    }
  }
}
