package utils

import (
	"errors"
	"testing"
)

func TestAdd(t *testing.T) {
	cases := []struct {
		a, b, want float64
	}{
		{2, 3, 5},
		{-2, 3, 1},
		{0, 0, 0},
		{2.5, 0.5, 3},
	}
	for _, tc := range cases {
		if got := Add(tc.a, tc.b); got != tc.want {
			t.Errorf("Add(%v, %v) = %v, want %v", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestSubtract(t *testing.T) {
	cases := []struct {
		a, b, want float64
	}{
		{5, 3, 2},
		{3, 5, -2},
		{0, 0, 0},
	}
	for _, tc := range cases {
		if got := Subtract(tc.a, tc.b); got != tc.want {
			t.Errorf("Subtract(%v, %v) = %v, want %v", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestMultiply(t *testing.T) {
	cases := []struct {
		a, b, want float64
	}{
		{2, 3, 6},
		{-2, 3, -6},
		{0, 5, 0},
	}
	for _, tc := range cases {
		if got := Multiply(tc.a, tc.b); got != tc.want {
			t.Errorf("Multiply(%v, %v) = %v, want %v", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestDivide(t *testing.T) {
	cases := []struct {
		a, b, want float64
	}{
		{6, 3, 2},
		{5, 2, 2.5},
		{-6, 3, -2},
	}
	for _, tc := range cases {
		got, err := Divide(tc.a, tc.b)
		if err != nil {
			t.Fatalf("Divide(%v, %v) returned unexpected error: %v", tc.a, tc.b, err)
		}
		if got != tc.want {
			t.Errorf("Divide(%v, %v) = %v, want %v", tc.a, tc.b, got, tc.want)
		}
	}
}

func TestDivideByZero(t *testing.T) {
	_, err := Divide(5, 0)
	if !errors.Is(err, ErrDivideByZero) {
		t.Fatalf("Divide(5, 0) error = %v, want %v", err, ErrDivideByZero)
	}
}
