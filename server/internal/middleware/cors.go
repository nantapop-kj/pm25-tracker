package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func CORS(origins []string) fiber.Handler {
	cfg := cors.Config{
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}

	if len(origins) == 0 {
		cfg.AllowOrigins = "*"
	} else {
		cfg.AllowOrigins = strings.Join(origins, ",")
		cfg.AllowCredentials = true
	}

	return cors.New(cfg)
}
