package utils

import (
	"errors"
	"testing"

	"github.com/shopspring/decimal"
)

func d(s string) decimal.Decimal {
	return decimal.RequireFromString(s)
}

func TestAdd(t *testing.T) {
	cases := []struct {
		a, b, want string
	}{
		{"2", "3", "5"},
		{"-2", "3", "1"},
		{"0", "0", "0"},
		{"2.5", "0.5", "3"},
		{"0.1", "0.2", "0.3"}, // classic float64 precision case: raw 0.1+0.2 == 0.30000000000000004
	}
	for _, tc := range cases {
		got := Add(d(tc.a), d(tc.b))
		want := d(tc.want)
		if !got.Equal(want) {
			t.Errorf("Add(%v, %v) = %v, want %v", tc.a, tc.b, got, want)
		}
	}
}

func TestSubtract(t *testing.T) {
	cases := []struct {
		a, b, want string
	}{
		{"5", "3", "2"},
		{"3", "5", "-2"},
		{"0", "0", "0"},
		{"0.3", "0.2", "0.1"}, // raw 0.3-0.2 == 0.09999999999999998
	}
	for _, tc := range cases {
		got := Subtract(d(tc.a), d(tc.b))
		want := d(tc.want)
		if !got.Equal(want) {
			t.Errorf("Subtract(%v, %v) = %v, want %v", tc.a, tc.b, got, want)
		}
	}
}

func TestMultiply(t *testing.T) {
	cases := []struct {
		a, b, want string
	}{
		{"2", "3", "6"},
		{"-2", "3", "-6"},
		{"0", "5", "0"},
		{"0.1", "0.2", "0.02"}, // raw 0.1*0.2 == 0.020000000000000004
	}
	for _, tc := range cases {
		got := Multiply(d(tc.a), d(tc.b))
		want := d(tc.want)
		if !got.Equal(want) {
			t.Errorf("Multiply(%v, %v) = %v, want %v", tc.a, tc.b, got, want)
		}
	}
}

func TestDivide(t *testing.T) {
	cases := []struct {
		a, b, want string
	}{
		{"6", "3", "2"},
		{"5", "2", "2.5"},
		{"-6", "3", "-2"},
	}
	for _, tc := range cases {
		got, err := Divide(d(tc.a), d(tc.b))
		if err != nil {
			t.Fatalf("Divide(%v, %v) returned unexpected error: %v", tc.a, tc.b, err)
		}
		want := d(tc.want)
		if !got.Equal(want) {
			t.Errorf("Divide(%v, %v) = %v, want %v", tc.a, tc.b, got, want)
		}
	}
}

func TestDivideByZero(t *testing.T) {
	_, err := Divide(d("5"), d("0"))
	if !errors.Is(err, ErrDivideByZero) {
		t.Fatalf("Divide(5, 0) error = %v, want %v", err, ErrDivideByZero)
	}
}
