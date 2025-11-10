import { GET, POST } from '@/app/api/entries/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/entries/[id]/route'
import * as queries from '@/lib/supabase/queries'

// Mock the queries module
jest.mock('@/lib/supabase/queries', () => ({
  getEntries: jest.fn(),
  getEntry: jest.fn(),
  createEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
}))

describe('Entries API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/entries', () => {
    it('returns all entries successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Test Entry',
          content: 'Test content',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      ;(queries.getEntries as jest.Mock).mockResolvedValue(mockEntries)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.entries).toEqual(mockEntries)
      expect(queries.getEntries).toHaveBeenCalledTimes(1)
    })

    it('returns error when getEntries fails', async () => {
      const errorMessage = 'Database error'
      ;(queries.getEntries as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })

    it('returns empty array when no entries exist', async () => {
      ;(queries.getEntries as jest.Mock).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.entries).toEqual([])
    })
  })

  describe('POST /api/entries', () => {
    it('creates a new entry successfully', async () => {
      const newEntry = { title: 'New Entry', content: 'New content' }
      const createdEntry = {
        id: '1',
        user_id: 'user-1',
        ...newEntry,
        created_at: '2024-01-01T00:00:00Z',
      }

      ;(queries.createEntry as jest.Mock).mockResolvedValue(createdEntry)

      const request = new Request('http://localhost:3000/api/entries', {
        method: 'POST',
        body: JSON.stringify(newEntry),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.entry).toEqual(createdEntry)
      expect(queries.createEntry).toHaveBeenCalledWith(newEntry)
    })

    it('returns 400 when title is missing', async () => {
      const request = new Request('http://localhost:3000/api/entries', {
        method: 'POST',
        body: JSON.stringify({ content: 'Content only' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
      expect(queries.createEntry).not.toHaveBeenCalled()
    })

    it('returns 400 when content is missing', async () => {
      const request = new Request('http://localhost:3000/api/entries', {
        method: 'POST',
        body: JSON.stringify({ title: 'Title only' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
      expect(queries.createEntry).not.toHaveBeenCalled()
    })

    it('returns 400 when both title and content are missing', async () => {
      const request = new Request('http://localhost:3000/api/entries', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })

    it('returns error when createEntry fails', async () => {
      const errorMessage = 'User not authenticated'
      ;(queries.createEntry as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/entries', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', content: 'Test' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('GET /api/entries/[id]', () => {
    it('returns a single entry successfully', async () => {
      const mockEntry = {
        id: '1',
        user_id: 'user-1',
        title: 'Test Entry',
        content: 'Test content',
        created_at: '2024-01-01T00:00:00Z',
      }

      ;(queries.getEntry as jest.Mock).mockResolvedValue(mockEntry)

      const request = new Request('http://localhost:3000/api/entries/1')
      const params = Promise.resolve({ id: '1' })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.entry).toEqual(mockEntry)
      expect(queries.getEntry).toHaveBeenCalledWith('1')
    })

    it('returns error when entry not found', async () => {
      const errorMessage = 'Entry not found'
      ;(queries.getEntry as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/entries/999')
      const params = Promise.resolve({ id: '999' })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('PUT /api/entries/[id]', () => {
    it('updates an entry successfully', async () => {
      const updateData = { title: 'Updated Title', content: 'Updated content' }
      const updatedEntry = {
        id: '1',
        user_id: 'user-1',
        ...updateData,
        created_at: '2024-01-01T00:00:00Z',
      }

      ;(queries.updateEntry as jest.Mock).mockResolvedValue(updatedEntry)

      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.entry).toEqual(updatedEntry)
      expect(queries.updateEntry).toHaveBeenCalledWith('1', updateData)
    })

    it('returns 400 when title is missing', async () => {
      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'PUT',
        body: JSON.stringify({ content: 'Content only' }),
      })
      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
      expect(queries.updateEntry).not.toHaveBeenCalled()
    })

    it('returns 400 when content is missing', async () => {
      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Title only' }),
      })
      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })

    it('returns error when update fails', async () => {
      const errorMessage = 'Permission denied'
      ;(queries.updateEntry as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Test', content: 'Test' }),
      })
      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })

  describe('DELETE /api/entries/[id]', () => {
    it('deletes an entry successfully', async () => {
      ;(queries.deleteEntry as jest.Mock).mockResolvedValue(undefined)

      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: '1' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(queries.deleteEntry).toHaveBeenCalledWith('1')
    })

    it('returns error when delete fails', async () => {
      const errorMessage = 'Entry not found'
      ;(queries.deleteEntry as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/entries/1', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: '1' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })

    it('returns error when user tries to delete another users entry', async () => {
      const errorMessage = 'Permission denied'
      ;(queries.deleteEntry as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const request = new Request('http://localhost:3000/api/entries/999', {
        method: 'DELETE',
      })
      const params = Promise.resolve({ id: '999' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe(errorMessage)
    })
  })
})
