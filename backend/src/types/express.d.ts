import type { AuthTokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface User extends AuthTokenPayload {}
  }
}

export {};
