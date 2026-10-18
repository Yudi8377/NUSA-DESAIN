import { createInternalNeonAuth } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Keep the Neon wrapper and the Better Auth React adapter together so the
// workspace gate can request the JWT issued by Neon Auth.
const neonAuth = authUrl
  ? createInternalNeonAuth(authUrl, {
      adapter: BetterAuthReactAdapter({
        fetchOptions: { credentials: 'include' },
      }),
    })
  : null

export const authClient: any = neonAuth
  ? Object.assign(neonAuth.adapter, { getJWTToken: neonAuth.getJWTToken })
  : null
export const isAuthConfigured = Boolean(authUrl)
