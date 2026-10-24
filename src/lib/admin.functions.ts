import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { changeCredentials, parseCredentials } from "./credentials";

export const updateAdminCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => parseCredentials(input))
  .handler(async ({ data, context }) => {
    const { data: identity, error: identityError } = await context.supabase.auth.getUser();
    const email = identity.user?.email;
    if (identityError || !email) throw new Error("Please sign in again.");
    return changeCredentials(data, {
      isAdmin: async () => {
        const result = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
        return !result.error && result.data === true;
      },
      verifyCurrentPassword: async (password) => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) throw new Error("Login settings are unavailable.");
        const verifier = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        const result = await verifier.auth.signInWithPassword({ email, password });
        const verified = !result.error && result.data.user?.id === context.userId;
        if (result.data.session) await verifier.auth.signOut({ scope: "local" });
        return verified;
      },
      update: async (username, password) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
          email: `${username}@lalitha.local`, email_confirm: true,
          ...(password ? { password } : {}),
        });
        if (result.error) throw new Error("Could not change login details. The username may be taken or the password rejected.");
      },
    });
  });