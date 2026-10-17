import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Use Neon's React adapter for the Vite/React client. The adapter preserves
// Better Auth result shapes and Neon-specific session/JWT handling.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, { adapter: BetterAuthReactAdapter() })
  : null
export const isAuthConfigured = Boolean(authUrl)
