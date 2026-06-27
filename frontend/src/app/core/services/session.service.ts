import { Injectable } from '@angular/core';

const SESSION_ID_KEY = 'webee_session_id';

@Injectable({ providedIn: 'root' })
export class SessionService {
  /** Return the persisted browser session ID, creating one for first-time guests. */
  getSessionId(): string {
    const existingId = localStorage.getItem(SESSION_ID_KEY);

    if (existingId) {
      return existingId;
    }

    const nextId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, nextId);
    return nextId;
  }
}
