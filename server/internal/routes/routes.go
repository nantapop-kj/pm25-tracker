package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/bootstrap"
)

func RegisterRoutes(app *fiber.App, deps *bootstrap.Dependencies) {
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// group := app.Group("/api/v1")
}
