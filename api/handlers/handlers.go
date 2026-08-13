package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"sezzle-code-challenge/api/models"
	"sezzle-code-challenge/api/utils"
)

func bindOperands(c *gin.Context) (a, b float64, ok bool) {
	var req models.OperationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "invalid request: expected numeric fields \"a\" and \"b\""})
		return 0, 0, false
	}
	return *req.A, *req.B, true
}

func Add(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, models.OperationResponse{Result: utils.Add(a, b)})
}

func Subtract(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, models.OperationResponse{Result: utils.Subtract(a, b)})
}

func Multiply(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	c.JSON(http.StatusOK, models.OperationResponse{Result: utils.Multiply(a, b)})
}

func Divide(c *gin.Context) {
	a, b, ok := bindOperands(c)
	if !ok {
		return
	}
	result, err := utils.Divide(a, b)
	if err != nil {
		if errors.Is(err, utils.ErrDivideByZero) {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "internal error"})
		return
	}
	c.JSON(http.StatusOK, models.OperationResponse{Result: result})
}
