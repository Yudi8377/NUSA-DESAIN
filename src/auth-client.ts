import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Keep Neon's managed React adapter for session handling and JWT support.
// Protected API requests use authClient.token() -> data.token (see AuthGate).
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null

export const isAuthConfigured = Boolean(authUrl)
