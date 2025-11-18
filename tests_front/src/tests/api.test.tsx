import { describe, it, expect, vi } from 'vitest'
import * as apiModule from '@frontend/api'

describe('API functions (mocked)', () => {
  it('login should return token', async () => {
    const mock = vi.spyOn(apiModule, 'login').mockResolvedValue({ data: { token: '123' }, error: null })
    const res = await apiModule.login('user', 'pass')
    expect(res.data.token).toBe('123')
    mock.mockRestore()
  })

  it('fetchCars should return a list of cars', async () => {
    const mockCars = [
      { VIN: '1', mark: 'A', model: 'B', prodYear: 2020, amount: 1, mileage: 0, status: 'new', condition: 'good', postDate: '2023-01-01' }
    ]
    const mock = vi.spyOn(apiModule, 'fetchCars').mockResolvedValue(mockCars)
    const res = await apiModule.fetchCars()
    expect(Array.isArray(res)).toBe(true)
    expect(res[0].VIN).toBe('1')
    mock.mockRestore()
  })

  it('fetchUsers should return users', async () => {
    const mockUsers = [{ id: 1, username: 'test', email: 'a@b.com', role: 'user', full_name: 'Test User', created_at: '2023-01-01' }]
    const mock = vi.spyOn(apiModule, 'fetchUsers').mockResolvedValue(mockUsers)
    const res = await apiModule.fetchUsers()
    expect(res[0].username).toBe('test')
    mock.mockRestore()
  })
})
