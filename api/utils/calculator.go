package utils

import (
	"errors"

	"github.com/shopspring/decimal"
)

// ErrDivideByZero is returned by Divide when the divisor is zero.
var ErrDivideByZero = errors.New("Cannot divide by zero")

func Add(a, b decimal.Decimal) decimal.Decimal {
	return a.Add(b)
}

func Subtract(a, b decimal.Decimal) decimal.Decimal {
	return a.Sub(b)
}

func Multiply(a, b decimal.Decimal) decimal.Decimal {
	return a.Mul(b)
}

func Divide(a, b decimal.Decimal) (decimal.Decimal, error) {
	if b.IsZero() {
		return decimal.Decimal{}, ErrDivideByZero
	}
	return a.Div(b), nil
}
