import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './theme-provider'

const STORAGE_KEY = 'calculator-theme'

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light and does not apply the dark class', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider>{children}</ThemeProvider>
      ),
    })

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies the dark class and persists the choice when switching theme', async () => {
    function Consumer() {
      const { theme, setTheme } = useTheme()
      return (
        <button onClick={() => setTheme('dark')}>current: {theme}</button>
      )
    }

    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
    expect(screen.getByRole('button')).toHaveTextContent('current: dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('reads a persisted theme from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider>{children}</ThemeProvider>
      ),
    })

    expect(result.current.theme).toBe('dark')
  })

  it('throws when useTheme is used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    )
  })
})
