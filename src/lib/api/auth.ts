import { LoginCredentials, SignupCredentials } from '@/types/auth.types'

/**
 * Sign up a new user
 */
export async function apiSignUp(credentials: SignupCredentials) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to sign up')
  }

  return data.data
}

/**
 * Sign in a user
 */
export async function apiSignIn(credentials: LoginCredentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to sign in')
  }

  return data.data
}

/**
 * Sign out the current user
 */
export async function apiSignOut() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to sign out')
  }

  return data
}

/**
 * Get the current authenticated user
 */
export async function apiGetCurrentUser() {
  const response = await fetch('/api/auth/user', {
    method: 'GET',
  })

  if (!response.ok) {
    if (response.status === 401) {
      return null
    }
    const data = await response.json()
    throw new Error(data.error || 'Failed to get user')
  }

  const data = await response.json()
  return data.user
}
