import type { ComponentProps } from 'react'
import { useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const disabled = loading || error !== null

  function inputDigit(digit: string) {
    if (disabled) return
    if (overwrite) {
      setDisplay(digit)
      setOverwrite(false)
      return
    }
    if (display.replace(/[-.]/g, '').length >= MAX_DIGITS) return
    setDisplay(display === '0' ? digit : display + digit)
  }

  function inputDecimal() {
    if (disabled) return
    if (overwrite) {
      setDisplay('0.')
      setOverwrite(false)
      return
    }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  function backspace() {
    if (disabled || overwrite) return
    const next = display.slice(0, -1)
    setDisplay(next === '' || next === '-' ? '0' : next)
  }

  function clear() {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setOverwrite(true)
    setError(null)
    setLoading(false)
  }

  async function runCalculation(op: Operation, a: number, b: number) {
    setLoading(true)
    try {
      const result = await calculate(op, a, b)
      setDisplay(formatNumber(result))
      setError(null)
      return result
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function pressOperator(nextOperator: Operation) {
    if (disabled) return

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
    if (disabled || operator === null || previousValue === null) return
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

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="flex flex-col gap-4">
        <div className="flex min-h-20 flex-col justify-end gap-1 rounded-lg bg-muted px-4 py-3">
          <div className="h-5 truncate text-right text-sm text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : previousValue !== null && operator ? (
              `${formatNumber(previousValue)} ${OPERATOR_SYMBOLS[operator]}`
            ) : (
              ' '
            )}
          </div>
          <div className="truncate text-right text-4xl font-semibold tabular-nums">
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
          <CalcButton onClick={backspace} disabled={disabled || overwrite}>
            {'⌫'}
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('divide')}
            disabled={disabled}
          >
            {OPERATOR_SYMBOLS.divide}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('7')} disabled={disabled}>
            7
          </CalcButton>
          <CalcButton onClick={() => inputDigit('8')} disabled={disabled}>
            8
          </CalcButton>
          <CalcButton onClick={() => inputDigit('9')} disabled={disabled}>
            9
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('multiply')}
            disabled={disabled}
          >
            {OPERATOR_SYMBOLS.multiply}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('4')} disabled={disabled}>
            4
          </CalcButton>
          <CalcButton onClick={() => inputDigit('5')} disabled={disabled}>
            5
          </CalcButton>
          <CalcButton onClick={() => inputDigit('6')} disabled={disabled}>
            6
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('subtract')}
            disabled={disabled}
          >
            {OPERATOR_SYMBOLS.subtract}
          </CalcButton>

          <CalcButton onClick={() => inputDigit('1')} disabled={disabled}>
            1
          </CalcButton>
          <CalcButton onClick={() => inputDigit('2')} disabled={disabled}>
            2
          </CalcButton>
          <CalcButton onClick={() => inputDigit('3')} disabled={disabled}>
            3
          </CalcButton>
          <CalcButton
            variant="outline"
            onClick={() => pressOperator('add')}
            disabled={disabled}
          >
            {OPERATOR_SYMBOLS.add}
          </CalcButton>

          <CalcButton
            className="col-span-2"
            onClick={() => inputDigit('0')}
            disabled={disabled}
          >
            0
          </CalcButton>
          <CalcButton onClick={inputDecimal} disabled={disabled}>
            .
          </CalcButton>
          <CalcButton
            variant="default"
            onClick={pressEquals}
            disabled={disabled || operator === null}
          >
            =
          </CalcButton>
        </div>
      </CardContent>
    </Card>
  )
}
