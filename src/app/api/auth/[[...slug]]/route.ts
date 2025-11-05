import { NextResponse } from 'next/server'
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase/auth'

/**
 * POST /api/auth/signup
 * POST /api/auth/login
 * POST /api/auth/logout
 */
export async function POST(request: Request) {
  const { pathname } = new URL(request.url)

  // POST /api/auth/signup
  if (pathname.endsWith('/signup')) {
    try {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const data = await signUp({ email, password })
      return NextResponse.json({ data }, { status: 201 })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign up'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  // POST /api/auth/login
  if (pathname.endsWith('/login')) {
    try {
      const body = await request.json()
      const { email, password } = body

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const data = await signIn({ email, password })
      return NextResponse.json({ data }, { status: 200 })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in'
      return NextResponse.json({ error: message }, { status: 401 })
    }
  }

  // POST /api/auth/logout
  if (pathname.endsWith('/logout')) {
    try {
      await signOut()
      return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign out'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
}

/**
 * GET /api/auth/user
 */
export async function GET(request: Request) {
  const { pathname } = new URL(request.url)

  // GET /api/auth/user
  if (pathname.endsWith('/user')) {
    try {
      const user = await getCurrentUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      return NextResponse.json({ user }, { status: 200 })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get user'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
}
