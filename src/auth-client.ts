import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// Use the documented adapter factory with no custom arguments. Passing fetchOptions
// into the adapter factory is not supported by @neondatabase/auth 0.6.0-beta and
// can corrupt the underlying fetch configuration in the browser.
export const authClient: any = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null

export const isAuthConfigured = Boolean(authUrl)
