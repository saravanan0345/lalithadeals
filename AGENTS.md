<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Cart prices, offers and totals are computed only on the server (`src/lib/pricing.ts` via `shop.functions.ts`); the browser sends product ids and quantities only — prevents price tampering.
- Product/offer images live in a private storage bucket and are served through `/api/public/images/*` — the workspace blocks public buckets, and WhatsApp messages need public image links.
- Admin access = `admin` row in `user_roles`, auto-granted by a trigger to the single owner account; public signup is disabled — only the owner can ever become admin.
- Admin signs in with a username mapped to `<username>@lalitha.local` (`src/lib/admin.ts`) — auth requires an email.
- Credential changes use an authenticated server function that checks the admin role and reauthenticates the current password before changing Auth email/password; roles remain bound to the immutable user ID, and Auth owns salted password hashing.
- Owner provisioning is private through Cloud Users with public signup disabled; the bootstrap trigger grants the initial owner only when no admin exists, preventing a second owner after username changes.
- Profile details live in owner-scoped `profiles`; credential settings have a client-only pre-navigation guard and server-side authorization, avoiding private SSR reads.
- Login failures are classified by transport status in a browser-safe helper, never by displaying provider messages, to prevent account-state disclosure.
- Dashboard demo lives on a separate development-gated route with local-only state and no authentication token, admin-role bypass, or private-data calls; production always uses real authentication.
