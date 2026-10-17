import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// GitHub Pages and Neon Auth are different origins. Include the session
// cookie on cross-origin Auth requests so token() can mint a JWT.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
      fetchOptions: { credentials: 'include' },
    })
  : null
export const isAuthConfigured = Boolean(authUrl)
