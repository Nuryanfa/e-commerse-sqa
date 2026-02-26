package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/config"
)

func main() {

	_ = config.InitDB() 

	router := gin.Default()

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Server berjalan dan siap!",
		})
	})


	log.Println("Server Golang menyala di http://localhost:8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}