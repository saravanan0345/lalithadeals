export type LoginFailure = "credentials" | "rate-limit" | "unavailable";

// Never surface provider messages: they may disclose account state or details.
export function classifyLoginFailure(error: unknown): LoginFailure {
  if (error instanceof TypeError) return "unavailable";
  if (typeof error !== "object" || error === null) return "credentials";
  const status = "status" in error ? error.status : undefined;
  if (status === 429) return "rate-limit";
  if (status === 0 || (typeof status === "number" && status >= 500)) return "unavailable";
  return "credentials";
}

export const loginFeedback: Record<LoginFailure, string> = {
  credentials: "Unable to sign in. Check your username and password, then try again.",
  "rate-limit": "Too many sign-in attempts. Please wait a few minutes before trying again.",
  unavailable: "Sign-in is temporarily unavailable. Check your connection and try again.",
};