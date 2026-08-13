package models

import "github.com/shopspring/decimal"

// OperationRequest is the JSON body for all calculator operations.
// A and B are pointers so "required" distinguishes a missing field from
// an explicit zero, which is a legitimate operand for a calculator.
// decimal.Decimal parses the request's exact decimal digits instead of
// routing through float64, so values like 0.1 are never binary-rounded.
type OperationRequest struct {
	A *decimal.Decimal `json:"a" binding:"required"`
	B *decimal.Decimal `json:"b" binding:"required"`
}

// OperationResponse is the JSON body returned on a successful calculation.
// Result is a float64: the arithmetic itself runs on decimal.Decimal so
// intermediate results stay exact, and the final value is converted to
// float64 only at the response boundary, once, for a plain JSON number.
type OperationResponse struct {
	Result float64 `json:"result"`
}

// ErrorResponse is the JSON body returned when a request fails.
type ErrorResponse struct {
	Error string `json:"error"`
}
