import type { User, UserRole } from "./types";

/**
 * Auth stubs — replace this file with Member 7's real Auth.js helpers when
 * the shared auth layer lands. Everything else imports from this module, so
 * the swap is a one-file change.
 *
 * IDs are real UUIDs because events.owner_id and event_hosts.user_id are
 * Postgres uuid columns.
 */
export const STUB_ORGANIZER: User = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "aritra@example.com",
  role: "organizer",
  status: "active",
};

export const STUB_ADMIN: User = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "admin@example.com",
  role: "admin",
  status: "active",
};

export const STUB_HOST: User = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "cohost@example.com",
  role: "attendee",
  status: "active",
};

const STUB_USERS: readonly User[] = [STUB_ORGANIZER, STUB_ADMIN, STUB_HOST];

const BY_ID = new Map(STUB_USERS.map((user) => [user.id, user]));
const BY_EMAIL = new Map(
  STUB_USERS.map((user) => [user.email.toLowerCase(), user]),
);

export async function getCurrentUser(): Promise<User | null> {
  return STUB_ORGANIZER;
}

/**
 * Throws a `FORBIDDEN` error when the current stub user does not hold one of
 * the allowed roles. Actions catch this and return a serializable error.
 */
export async function requireRole(
  roles: UserRole | readonly UserRole[],
): Promise<User> {
  const allowed = Array.isArray(roles) ? roles : [roles];
  const user = await getCurrentUser();

  if (!user || !allowed.includes(user.role)) {
    const error = new Error("FORBIDDEN") as Error & { code: string };
    error.code = "FORBIDDEN";
    throw error;
  }

  return user;
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  return BY_ID.get(userId)?.role ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return BY_EMAIL.get(email.trim().toLowerCase()) ?? null;
}

export async function getUserEmail(userId: string): Promise<string | null> {
  return BY_ID.get(userId)?.email ?? null;
}

/** Synchronous lookup used when mapping calendar cards. */
export function getStubUserEmail(userId: string): string | null {
  return BY_ID.get(userId)?.email ?? null;
}
