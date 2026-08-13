const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

export class ApiError extends Error {}

export async function calculate(
  operation: Operation,
  a: number,
  b: number,
): Promise<number> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/${operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a, b }),
    })
  } catch {
    throw new ApiError('Unable to reach the calculator service')
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : 'Something went wrong'
    throw new ApiError(message)
  }

  return (data as { result: number }).result
}
