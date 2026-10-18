import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Use the supported public Neon Auth client factory. The internal factory
// can route a Promise into the native fetch method slot in browser builds,
// producing: "[object Promise] is not a valid HTTP method".
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter({
        fetchOptions: { credentials: 'include' },
      }),
    })
  : null

export const isAuthConfigured = Boolean(authUrl)
