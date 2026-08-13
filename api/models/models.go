package models

// OperationRequest is the JSON body for all calculator operations.
// A and B are pointers so "required" distinguishes a missing field from
// an explicit zero, which is a legitimate operand for a calculator.
type OperationRequest struct {
	A *float64 `json:"a" binding:"required"`
	B *float64 `json:"b" binding:"required"`
}

// OperationResponse is the JSON body returned on a successful calculation.
type OperationResponse struct {
	Result float64 `json:"result"`
}

// ErrorResponse is the JSON body returned when a request fails.
type ErrorResponse struct {
	Error string `json:"error"`
}
