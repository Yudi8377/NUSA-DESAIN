import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthVanillaAdapter } from '@neondatabase/auth/vanilla/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// This app uses imperative auth methods only; it does not use React auth hooks.
// Use the vanilla adapter to avoid the React adapter's token-helper integration
// on the production SPA while retaining Neon Auth's documented Better Auth API.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthVanillaAdapter(),
    })
  : null

export const isAuthConfigured = Boolean(authUrl)
