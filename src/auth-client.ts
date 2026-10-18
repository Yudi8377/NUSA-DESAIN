import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Neon’s React adapter injects the JWT returned by Managed Auth into the
// session and exposes getJWTToken(). Keep this adapter for the browser app.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null

export const isAuthConfigured = Boolean(authUrl)
