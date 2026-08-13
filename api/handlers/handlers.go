package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"sezzle-code-challenge/api/models"
	"sezzle-code-challenge/api/utils"
)

func bindOperands(c *gin.Context) (a, b decimal.Decimal, ok bool) {
	var req models.OperationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid request: expected numeric fields \"a\" and \"b\""})
		return decimal.Decimal{}, decimal.Decimal{}, false
	}
	return *req.A, *req.B, true
}

func Add(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	result, _ := utils.Add(a, b).Float64()
	c.JSON(http.StatusOK, models.OperationResponse{Result: result})
}

func Subtract(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	result, _ := utils.Subtract(a, b).Float64()
	c.JSON(http.StatusOK, models.OperationResponse{Result: result})
}

func Multiply(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	result, _ := utils.Multiply(a, b).Float64()
	c.JSON(http.StatusOK, models.OperationResponse{Result: result})
}

func Divide(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	quotient, err := utils.Divide(a, b)
	if err != nil {
		if errors.Is(err, utils.ErrDivideByZero) {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "internal error"})
		return
	}
	result, _ := quotient.Float64()
	c.JSON(http.StatusOK, models.OperationResponse{Result: result})
}
