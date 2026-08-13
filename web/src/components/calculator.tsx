import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ApiError, calculate, type Operation } from '@/lib/api'
import { formatNumber } from '@/lib/format-number'
import { cn } from '@/lib/utils'

const MAX_DIGITS = 15

const OPERATOR_SYMBOLS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
}

function CalcButton({
  className,
  variant = 'ghost',
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      className={cn('h-14 text-xl font-normal', className)}
      {...props}
    />
  )
}

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operation | null>(null)
  const [overwrite, setOverwrite] = useState(true)
  const [loading, setLoading] = useState(false)

  function inputDigit(digit: string) {
    if (loading) return
    if (overwrite) {
      setDisplay(digit)
      setOverwrite(false)
      return
    }
    if (display.replace(/[-.]/g, '').length >= MAX_DIGITS) return
    setDisplay(display === '0' ? digit : display + digit)
  }

  function inputDecimal() {
    if (loading) return
    if (overwrite) {
      setDisplay('0.')
      setOverwrite(false)
      return
    }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  function backspace() {
    if (loading || overwrite) return
    const next = display.slice(0, -1)
    setDisplay(next === '' || next === '-' ? '0' : next)
  }

  function clear() {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setOverwrite(true)
    setLoading(false)
  }

  async function runCalculation(op: Operation, a: number, b: number) {
    setLoading(true)
    try {
      const result = await calculate(op, a, b)
      setDisplay(formatNumber(result))
      return result
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Something went wrong',
      )
      return null
    } finally {
      setLoading(false)
    }
  }

  async function pressOperator(nextOperator: Operation) {
    if (loading) return

    if (operator && previousValue !== null && !overwrite) {
      const result = await runCalculation(
        operator,
        previousValue,
        Number.parseFloat(display),
      )
      if (result === null) return
      setPreviousValue(result)
    } else {
      setPreviousValue(Number.parseFloat(display))
    }

    setOperator(nextOperator)
    setOverwrite(true)
  }

  async function pressEquals() {
    if (loading || operator === null || previousValue === null) return
    const result = await runCalculation(
      operator,
      previousValue,
      Number.parseFloat(display),
    )
    if (result === null) return
    setPreviousValue(null)
    setOperator(null)
    setOverwrite(true)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key >= '0' && event.key <= '9') {
        inputDigit(event.key)
        return
      }

      switch (event.key) {
        case '.':
        case ',':
          inputDecimal()
          break
        case '+':
          pressOperator('add')
          break
        case '-':
          pressOperator('subtract')
          break
        case '*':
          pressOperator('multiply')
          break
        case '/':
          event.preventDefault()
          pressOperator('divide')
          break
        case 'Enter':
        case '=':
          event.preventDefault()
          pressEquals()
          break
        case 'Backspace':
        case 'Escape':
          clear()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, previousValue, operator, overwrite, loading])

  return (
    <Card className="w-full max-w-xs font-mono">
      <CardContent className="flex flex-col gap-4">
        <div className="flex min-h-20 flex-col justify-end gap-1 rounded-lg bg-muted px-4 py-3">
          <div
            data-testid="calculator-hint"
            className="flex h-5 items-center justify-end gap-1.5 truncate text-right text-sm text-muted-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Calculating…</span>
              </>
            ) : previousValue !== null && operator ? (
              `${formatNumber(previousValue)} ${OPERATOR_SYMBOLS[operator]}`
            ) : (
              ' '
            )}
          </div>
          <div
            data-testid="calculator-display"
            className={cn(
              'truncate text-right text-4xl font-semibold tabular-nums',
              loading && 'animate-pulse',
            )}
          >
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <CalcButton
            className="col-span-2"
            variant="secondary"
            onClick={clear}
            disabled={loading}
          >
            AC
          </CalcButton>
          <CalcButton onClick={backspace} disabled={loading || overwrite}>
            {'⌫'}
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('divide')}
            disabled={loading}
          >
            {OPERATOR_SYMBOLS.divide}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('7')} disabled={loading}>
            7
          </CalcButton>
          <CalcButton onClick={() => inputDigit('8')} disabled={loading}>
            8
          </CalcButton>
          <CalcButton onClick={() => inputDigit('9')} disabled={loading}>
            9
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('multiply')}
            disabled={loading}
          >
            {OPERATOR_SYMBOLS.multiply}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('4')} disabled={loading}>
            4
          </CalcButton>
          <CalcButton onClick={() => inputDigit('5')} disabled={loading}>
            5
          </CalcButton>
          <CalcButton onClick={() => inputDigit('6')} disabled={loading}>
            6
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('subtract')}
            disabled={loading}
          >
            {OPERATOR_SYMBOLS.subtract}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('1')} disabled={loading}>
            1
          </CalcButton>
          <CalcButton onClick={() => inputDigit('2')} disabled={loading}>
            2
          </CalcButton>
          <CalcButton onClick={() => inputDigit('3')} disabled={loading}>
            3
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('add')}
            disabled={loading}
          >
            {OPERATOR_SYMBOLS.add}
          </CalcButton>

          <CalcButton
            className="col-span-2"
            onClick={() => inputDigit('0')}
            disabled={loading}
          >
            0
          </CalcButton>
          <CalcButton onClick={inputDecimal} disabled={loading}>
            .
          </CalcButton>
          <CalcButton
            variant="default"
            onClick={pressEquals}
            disabled={loading || operator === null}
          >
            =
          </CalcButton>
        </div>
      </CardContent>
    </Card>
  )
}
