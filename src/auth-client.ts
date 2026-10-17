import { createAuthClient } from '@neondatabase/auth'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

// This URL is public configuration for Neon Auth, never a database credential.
export const authClient: any = authUrl ? createAuthClient(authUrl) : null
export const isAuthConfigured = Boolean(authUrl)
