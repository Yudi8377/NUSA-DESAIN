import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// The Neon Auth adapter accepts fetch options through its factory, not the
// createAuthClient config. Include cross-origin cookies for GitHub Pages.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter({
        fetchOptions: { credentials: 'include' },
      }),
    })
  : null
export const isAuthConfigured = Boolean(authUrl)
