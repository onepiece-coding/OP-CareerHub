/**
 * @file src/services/auth-service.ts
 */

import type { User } from "@/lib/types";

const USER_KEY = "user";

export const UserService = {
  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // ✅ Minimal structural guard — verify the critical fields exist
      // before trusting the cast. Clears stale/corrupt entries automatically.
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof parsed._id === "string" &&
        typeof parsed.email === "string"
      ) {
        return parsed as User;
      }

      // Stale/invalid structure — clear it so the app doesn't boot with corrupt state
      localStorage.removeItem(USER_KEY);
      return null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
};
