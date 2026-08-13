package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"sezzle-code-challenge/api/handlers"
)

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{allowedOrigin()},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type"},
	}))

	router.GET("/health", func(c *gin.Context) {
		c.Status(200)
	})

	api := router.Group("/api")
	{
		api.POST("/add", handlers.Add)
		api.POST("/subtract", handlers.Subtract)
		api.POST("/multiply", handlers.Multiply)
		api.POST("/divide", handlers.Divide)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func allowedOrigin() string {
	if origin := os.Getenv("ALLOWED_ORIGIN"); origin != "" {
		return origin
	}
	return "http://localhost:5173"
}
