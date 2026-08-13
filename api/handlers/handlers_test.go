package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func newRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/add", Add)
	router.POST("/api/subtract", Subtract)
	router.POST("/api/multiply", Multiply)
	router.POST("/api/divide", Divide)
	return router
}

func doRequest(t *testing.T, router *gin.Engine, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var reqBody bytes.Buffer
	if err := json.NewEncoder(&reqBody).Encode(body); err != nil {
		t.Fatalf("failed to encode request body: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, path, &reqBody)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func TestAddHandler(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/add", map[string]float64{"a": 2, "b": 3})

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp struct {
		Result float64 `json:"result"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp.Result != 5 {
		t.Errorf("result = %v, want 5", resp.Result)
	}
}

func TestSubtractHandler(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/subtract", map[string]float64{"a": 5, "b": 3})

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp struct {
		Result float64 `json:"result"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Result != 2 {
		t.Errorf("result = %v, want 2", resp.Result)
	}
}

func TestMultiplyHandler(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/multiply", map[string]float64{"a": 4, "b": 3})

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp struct {
		Result float64 `json:"result"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Result != 12 {
		t.Errorf("result = %v, want 12", resp.Result)
	}
}

func TestDivideHandler(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/divide", map[string]float64{"a": 10, "b": 2})

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp struct {
		Result float64 `json:"result"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Result != 5 {
		t.Errorf("result = %v, want 5", resp.Result)
	}
}

func TestDivideHandlerByZero(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/divide", map[string]float64{"a": 10, "b": 0})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}

	var resp struct {
		Error string `json:"error"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Error == "" {
		t.Error("expected non-empty error message")
	}
}

func TestHandlerMissingField(t *testing.T) {
	router := newRouter()
	w := doRequest(t, router, "/api/add", map[string]float64{"a": 2})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestHandlerInvalidJSON(t *testing.T) {
	router := newRouter()
	req := httptest.NewRequest(http.MethodPost, "/api/add", bytes.NewBufferString(`{"a": "not-a-number", "b": 3}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}
