import { describe, expect, it, vi } from "vitest";
import { changeCredentials, newPasswordSchema, parseCredentials } from "@/lib/credentials";
import { DEFAULT_ADDRESS, mapsLink, SHOP } from "@/lib/shop";

const input = { username: "new.owner", currentPassword: "current-test-password", newPassword: "New-test-password-123" };
function actions(admin = true, current = true) {
  return { isAdmin: vi.fn(async () => admin), verifyCurrentPassword: vi.fn(async () => current), update: vi.fn(async () => {}) };
}
describe("Owner credential rules", () => {
  it("rejects a non-admin before password verification or updates", async () => {
    const a = actions(false);
    await expect(changeCredentials(input, a)).rejects.toThrow("Administrator access required");
    expect(a.verifyCurrentPassword).not.toHaveBeenCalled();
    expect(a.update).not.toHaveBeenCalled();
  });
  it("requires the current password", () => {
    expect(() => parseCredentials({ ...input, currentPassword: "" })).toThrow();
  });
  it("rejects an incorrect current password without changing credentials", async () => {
    const a = actions(true, false);
    await expect(changeCredentials(input, a)).rejects.toThrow("Current password is incorrect");
    expect(a.update).not.toHaveBeenCalled();
  });
  it("passes new username and password to the real update boundary after verification", async () => {
    const a = actions();
    await expect(changeCredentials(input, a)).resolves.toEqual({ ok: true });
    expect(a.verifyCurrentPassword).toHaveBeenCalledWith(input.currentPassword);
    expect(a.update).toHaveBeenCalledWith("new.owner", input.newPassword);
  });
  it("allows username-only changes but still requires verification", async () => {
    const a = actions();
    await changeCredentials({ username: "changed.owner", currentPassword: input.currentPassword }, a);
    expect(a.verifyCurrentPassword).toHaveBeenCalledOnce();
    expect(a.update).toHaveBeenCalledWith("changed.owner", undefined);
  });
  it("rejects weak passwords", () => {
    expect(newPasswordSchema.safeParse("short").success).toBe(false);
    expect(newPasswordSchema.safeParse("longlowercase123!").success).toBe(false);
    expect(newPasswordSchema.safeParse(input.newPassword).success).toBe(true);
  });
  it("rejects invalid username characters rather than silently removing them", () => {
    expect(() => parseCredentials({ ...input, username: "new owner" })).toThrow();
  });
});
describe("Contact requirements", () => {
  it("opens directions to the configured address", () => {
    const url = new URL(mapsLink(DEFAULT_ADDRESS));
    expect(url.searchParams.get("destination")).toBe("1, Sri Kamatchi St, Padmavathi Nagar, Iyyappanthangal, Tamil Nadu 600077, India");
  });
  it("preserves the WhatsApp number", () => {
    expect(SHOP.waNumber).toBe("918072044100");
  });
});