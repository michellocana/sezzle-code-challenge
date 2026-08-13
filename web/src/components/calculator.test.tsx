import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { ApiError, calculate } from '@/lib/api'
import { Calculator } from './calculator'

vi.mock('@/lib/api', () => {
  class ApiError extends Error {}
  return {
    ApiError,
    calculate: vi.fn(),
  }
})

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

const mockedCalculate = vi.mocked(calculate)

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function display() {
  return screen.getByTestId('calculator-display')
}

function hint() {
  return screen.getByTestId('calculator-hint')
}

function button(name: string) {
  return screen.getByRole('button', { name })
}

describe('Calculator', () => {
  beforeEach(() => {
    mockedCalculate.mockReset()
    vi.mocked(toast.error).mockReset()
  })

  it('renders with a display of 0', () => {
    render(<Calculator />)
    expect(display()).toHaveTextContent('0')
  })

  it('builds up a number from digit presses', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('1'))
    await user.click(button('2'))
    await user.click(button('3'))

    expect(display()).toHaveTextContent('123')
  })

  it('only allows one decimal point', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('1'))
    await user.click(button('.'))
    await user.click(button('2'))
    await user.click(button('.'))
    await user.click(button('3'))

    expect(display()).toHaveTextContent('1.23')
  })

  it('backspaces the last digit, but not while overwriting', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    expect(button('⌫')).toBeDisabled()

    await user.click(button('1'))
    await user.click(button('2'))
    await user.click(button('⌫'))

    expect(display()).toHaveTextContent('1')
  })

  it('AC resets the display', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('1'))
    await user.click(button('2'))
    await user.click(button('AC'))

    expect(display()).toHaveTextContent('0')
  })

  it('performs addition through the API', async () => {
    mockedCalculate.mockResolvedValueOnce(5)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('2'))
    await user.click(button('+'))
    await user.click(button('3'))
    await user.click(button('='))

    await waitFor(() => expect(display()).toHaveTextContent('5'))
    expect(mockedCalculate).toHaveBeenCalledWith('add', 2, 3)
  })

  it('performs subtraction, multiplication and division through the API', async () => {
    const user = userEvent.setup()

    mockedCalculate.mockResolvedValueOnce(2)
    render(<Calculator />)
    await user.click(button('5'))
    await user.click(button('−'))
    await user.click(button('3'))
    await user.click(button('='))
    await waitFor(() => expect(display()).toHaveTextContent('2'))
    expect(mockedCalculate).toHaveBeenLastCalledWith('subtract', 5, 3)

    mockedCalculate.mockResolvedValueOnce(12)
    await user.click(button('AC'))
    await user.click(button('4'))
    await user.click(button('×'))
    await user.click(button('3'))
    await user.click(button('='))
    await waitFor(() => expect(display()).toHaveTextContent('12'))
    expect(mockedCalculate).toHaveBeenLastCalledWith('multiply', 4, 3)

    mockedCalculate.mockResolvedValueOnce(4)
    await user.click(button('AC'))
    await user.click(button('8'))
    await user.click(button('÷'))
    await user.click(button('2'))
    await user.click(button('='))
    await waitFor(() => expect(display()).toHaveTextContent('4'))
    expect(mockedCalculate).toHaveBeenLastCalledWith('divide', 8, 2)
  })

  it('chains operations by calculating the pending one first', async () => {
    mockedCalculate.mockResolvedValueOnce(5).mockResolvedValueOnce(9)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('2'))
    await user.click(button('+'))
    await user.click(button('3'))
    await user.click(button('+'))

    await waitFor(() =>
      expect(mockedCalculate).toHaveBeenNthCalledWith(1, 'add', 2, 3),
    )
    await waitFor(() => expect(display()).toHaveTextContent('5'))

    await user.click(button('4'))
    await user.click(button('='))

    await waitFor(() =>
      expect(mockedCalculate).toHaveBeenNthCalledWith(2, 'add', 5, 4),
    )
    await waitFor(() => expect(display()).toHaveTextContent('9'))
  })

  it('shows the pending operand and operator in the hint line', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('7'))
    await user.click(button('+'))

    expect(hint()).toHaveTextContent('7 +')
  })

  it('shows a loading indicator while the request is in flight', async () => {
    const { promise, resolve } = deferred<number>()
    mockedCalculate.mockReturnValueOnce(promise)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('2'))
    await user.click(button('+'))
    await user.click(button('3'))
    await user.click(button('='))

    expect(screen.getByText('Calculating…')).toBeInTheDocument()
    expect(button('=')).toBeDisabled()
    expect(button('7')).toBeDisabled()

    resolve(5)
    await waitFor(() => expect(display()).toHaveTextContent('5'))
  })

  it('shows a toast with the backend message and stays editable on API error', async () => {
    mockedCalculate.mockRejectedValueOnce(new ApiError('Cannot divide by zero'))
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('5'))
    await user.click(button('÷'))
    await user.click(button('0'))
    await user.click(button('='))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Cannot divide by zero'),
    )
    expect(button('1')).toBeEnabled()
    expect(display()).toHaveTextContent('0')
  })

  it('shows a generic toast message for unexpected failures', async () => {
    mockedCalculate.mockRejectedValueOnce(new Error('network down'))
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(button('1'))
    await user.click(button('+'))
    await user.click(button('1'))
    await user.click(button('='))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Something went wrong'),
    )
  })

  it('supports full keyboard entry: digits, operators, and Enter to calculate', async () => {
    mockedCalculate.mockResolvedValueOnce(2)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('1+1{Enter}')

    await waitFor(() => expect(display()).toHaveTextContent('2'))
    expect(mockedCalculate).toHaveBeenCalledWith('add', 1, 1)
  })

  it('supports keyboard shortcuts for subtract, multiply and divide', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('9-')
    expect(hint()).toHaveTextContent('9 −')

    await user.keyboard('{Escape}9*')
    expect(hint()).toHaveTextContent('9 ×')

    await user.keyboard('{Escape}9/')
    expect(hint()).toHaveTextContent('9 ÷')
  })

  it('supports the decimal point key', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('1.5')

    expect(display()).toHaveTextContent('1.5')
  })

  it('treats comma as a decimal separator too', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('1,5')

    expect(display()).toHaveTextContent('1.5')
  })

  it('the Backspace key clears the calculator, same as AC', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('12')
    expect(display()).toHaveTextContent('12')

    await user.keyboard('{Backspace}')

    expect(display()).toHaveTextContent('0')
  })

  it('the Escape key clears the calculator, same as AC', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('12')
    await user.keyboard('{Escape}')

    expect(display()).toHaveTextContent('0')
  })
})
