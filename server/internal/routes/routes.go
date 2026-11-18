package routes

import (
	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/bootstrap"
	"github.com/nantapop-kj/pm25-tracker/server/internal/routes/analytics"
	"github.com/nantapop-kj/pm25-tracker/server/internal/routes/local"
	"github.com/nantapop-kj/pm25-tracker/server/internal/routes/station"
)

func RegisterRoutes(app *fiber.App, deps *bootstrap.Dependencies) {
	h := deps.Handlers

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"code":   fiber.StatusOK,
		})
	})

	api := app.Group("/api/v1")
	api.Mount("/stations", station.Route(h.Station))
	api.Mount("/analytics", analytics.Route(h.Analytics))
	api.Mount("/local", local.Route(h.Local))
}
