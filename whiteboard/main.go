package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

var whiteServiceUrl = "https://cloudcapiv3.herewhite.com"
var whiteToken = os.Getenv("WHITE_TOKEN")

// const whiteToken = "WHITEcGFydG5lcl9pZD1zTHlGOTlHNFlTbkx1Y3Fna2E0a3Z5cnlmQTJxZjdoaFNXNDYmc2lnPWYwZGZmNjRkYWZkYTllZjM4ZGY4N2I5OTIwY2QxNTU5N2ZhZjI0MDk6YWRtaW5JZD0xNSZyb2xlPW1pbmkmZXhwaXJlX3RpbWU9MTU5MzUxOTQwNSZhaz1zTHlGOTlHNFlTbkx1Y3Fna2E0a3Z5cnlmQTJxZjdoaFNXNDYmY3JlYXRlX3RpbWU9MTU2MTk2MjQ1MyZub25jZT0xNTYxOTYyNDUzMjQ4MDA"

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()

	v1 := r.Group("v1")

	// create room
	v1.POST("/room/create", func(c *gin.Context) {
		var payload struct {
			Name  string `json:"name" binding:"required"`
			Limit int    `json:"limit"`
			Mode  string `json:"mode"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Limit == 0 {
			payload.Limit = 5
		}
		if payload.Mode == "" {
			payload.Mode = "persistent"
		}

		jsonString, _ := json.Marshal(payload)

		response, err := http.Post(whiteServiceUrl+"/room?token="+whiteToken, "application/json", bytes.NewBuffer(jsonString))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		defer response.Body.Close()

		var result interface{}

		parErr := json.NewDecoder(response.Body).Decode(&result)

		if parErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": parErr.Error()})
		}

		c.JSON(http.StatusOK, result)
		return
	})

	// join room
	v1.POST("/room/join", func(c *gin.Context) {
		var payload struct {
			UUID string `json:"uuid" binding:"required"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := http.Post(whiteServiceUrl+"/room/join?token="+whiteToken+"&uuid="+payload.UUID, "application/json", bytes.NewBufferString(""))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		defer response.Body.Close()

		var result interface{}

		parErr := json.NewDecoder(response.Body).Decode(&result)

		if parErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": parErr.Error()})
		}

		c.JSON(http.StatusOK, result)
		return
	})

	// close room
	// v1.POST("/room/close", func(c *gin.Context) {
	// 	var payload struct {
	// 		UUID string `json:"uuid" binding:"required"`
	// 	}

	// 	if err := c.ShouldBindJSON(&payload); err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	// 		return
	// 	}

	// 	jsonString, _ := json.Marshal(payload)

	// 	response, err := http.Post(whiteServiceUrl+"/room/close?token="+whiteToken, "application/json", bytes.NewBuffer(jsonString))

	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	// 	}

	// 	defer response.Body.Close()

	// 	var result interface{}

	// 	parErr := json.NewDecoder(response.Body).Decode(&result)

	// 	if parErr != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": parErr.Error()})
	// 	}

	// 	c.JSON(http.StatusOK, result)
	// 	return
	// })

	return r
}

func main() {
	r := setupRouter()
	// Listen and Server in 0.0.0.0:8080
	r.Run()
}
