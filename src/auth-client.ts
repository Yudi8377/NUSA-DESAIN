import { createAuthClient } from '@neondatabase/auth'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// The app uses imperative Better Auth methods and does not use React auth hooks.
// Keep the Managed Neon Auth client on its default adapter and use authClient.token()
// for JWT retrieval, as documented by Neon.
export const authClient: any = authUrl
  ? createAuthClient(authUrl)
  : null

export const isAuthConfigured = Boolean(authUrl)
