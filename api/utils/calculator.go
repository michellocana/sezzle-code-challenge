package utils

import "errors"

// ErrDivideByZero is returned by Divide when the divisor is zero.
var ErrDivideByZero = errors.New("cannot divide by zero")

func Add(a, b float64) float64 {
	return a + b
}

func Subtract(a, b float64) float64 {
	return a - b
}

func Multiply(a, b float64) float64 {
	return a * b
}

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}
