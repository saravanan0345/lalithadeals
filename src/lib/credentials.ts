import { z } from "zod";

export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,31}$/);
export const newPasswordSchema = z.string().min(12).max(128)
  .regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/);
const credentialSchema = z.object({
  username: usernameSchema,
  currentPassword: z.string().min(1).max(128),
  newPassword: newPasswordSchema.optional(),
});
export type CredentialInput = z.infer<typeof credentialSchema>;
export function parseCredentials(input: unknown): CredentialInput {
  const result = credentialSchema.safeParse(input);
  if (!result.success) throw new Error("Check your username and new password requirements.");
  return result.data;
}
export async function changeCredentials(input: CredentialInput, actions: {
  isAdmin: () => Promise<boolean>;
  verifyCurrentPassword: (password: string) => Promise<boolean>;
  update: (username: string, password?: string) => Promise<void>;
}) {
  if (!await actions.isAdmin()) throw new Error("Administrator access required.");
  const data = parseCredentials(input);
  if (!await actions.verifyCurrentPassword(data.currentPassword)) throw new Error("Current password is incorrect.");
  if (data.newPassword === data.currentPassword) throw new Error("Choose a different new password.");
  await actions.update(data.username, data.newPassword);
  return { ok: true as const };
}