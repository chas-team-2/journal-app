import { POST, GET } from '@/app/api/auth/[[...slug]]/route'
import * as auth from '@/lib/supabase/auth'

// Mock the auth module
jest.mock('@/lib/supabase/auth', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('creates a new user successfully', async () => {
      const mockData = {
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'token123' },
      }

      ;(auth.signUp as jest.Mock).mockResolvedValue(mockData)

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data).toEqual(mockData)
      expect(auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns 400 when email is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(auth.signUp).not.toHaveBeenCalled()
    })

    it('returns 400 when password is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(auth.signUp).not.toHaveBeenCalled()
    })

    it('returns error when signUp fails', async () => {
      const errorMessage = 'User already exists'
      ;(auth.signUp as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('POST /api/auth/login', () => {
    it('logs in a user successfully', async () => {
      const mockData = {
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'token123' },
      }

      ;(auth.signIn as jest.Mock).mockResolvedValue(mockData)

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual(mockData)
      expect(auth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns 400 when email is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(auth.signIn).not.toHaveBeenCalled()
    })

    it('returns 400 when password is missing', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email and password are required')
      expect(auth.signIn).not.toHaveBeenCalled()
    })

    it('returns 401 when credentials are invalid', async () => {
      const errorMessage = 'Invalid credentials'
      ;(auth.signIn as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('logs out a user successfully', async () => {
      ;(auth.signOut as jest.Mock).mockResolvedValue(undefined)

      const request = new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Signed out successfully')
      expect(auth.signOut).toHaveBeenCalledTimes(1)
    })

    it('returns error when signOut fails', async () => {
      const errorMessage = 'Failed to sign out'
      ;(auth.signOut as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('GET /api/auth/user', () => {
    it('returns the current user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }

      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/auth/user')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
      expect(auth.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('returns 401 when user is not authenticated', async () => {
      ;(auth.getCurrentUser as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/auth/user')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('returns error when getCurrentUser fails', async () => {
      const errorMessage = 'Database error'
      ;(auth.getCurrentUser as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/auth/user')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('Invalid endpoints', () => {
    it('returns 404 for invalid POST endpoint', async () => {
      const request = new Request('http://localhost:3000/api/auth/invalid', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid endpoint')
    })

    it('returns 404 for invalid GET endpoint', async () => {
      const request = new Request('http://localhost:3000/api/auth/invalid')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Invalid endpoint')
    })
  })
})
