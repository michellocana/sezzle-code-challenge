import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, calculate } from './api'

function mockFetchOnce(response: {
  ok: boolean
  json: () => Promise<unknown>
}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('calculate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts to the correct endpoint and returns the result', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ result: 5 }) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await calculate('add', 2, 3)

    expect(result).toBe(5)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/add$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 2, b: 3 }),
      }),
    )
  })

  it('throws an ApiError with the backend message on a non-ok response', async () => {
    mockFetchOnce({
      ok: false,
      json: async () => ({ error: 'Cannot divide by zero' }),
    })

    await expect(calculate('divide', 5, 0)).rejects.toThrow(
      new ApiError('Cannot divide by zero'),
    )
  })

  it('falls back to a generic message when the error body is unparseable', async () => {
    mockFetchOnce({
      ok: false,
      json: async () => {
        throw new Error('invalid json')
      },
    })

    await expect(calculate('add', 1, 1)).rejects.toThrow(
      new ApiError('Something went wrong'),
    )
  })

  it('throws an ApiError when the network request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    await expect(calculate('add', 1, 1)).rejects.toThrow(
      new ApiError('Unable to reach the calculator service'),
    )
  })
})
