import { describe, expect, it } from "vitest";
import { classifyLoginFailure } from "@/lib/login-feedback";

describe("Safe login failure classification", () => {
  it("treats invalid credentials, missing accounts and unconfirmed accounts identically", () => {
    for (const code of ["invalid_credentials", "user_not_found", "email_not_confirmed", "user_banned"]) {
      expect(classifyLoginFailure({ status: 400, code })).toBe("credentials");
    }
  });
  it("classifies throttling without inspecting account details", () => {
    expect(classifyLoginFailure({ status: 429 })).toBe("rate-limit");
  });
  it("classifies network and service failures", () => {
    expect(classifyLoginFailure(new TypeError("Failed to fetch"))).toBe("unavailable");
    expect(classifyLoginFailure({ status: 503 })).toBe("unavailable");
    expect(classifyLoginFailure({ status: 0 })).toBe("unavailable");
  });
  it("fails closed for unexpected errors", () => {
    expect(classifyLoginFailure({ message: "private account information" })).toBe("credentials");
    expect(classifyLoginFailure(null)).toBe("credentials");
  });
});