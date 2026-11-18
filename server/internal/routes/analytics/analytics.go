package analytics

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

func Route(h interfaces.AnalyticsHandler) *fiber.App {
	r := fiber.New()

	r.Get("/overview", h.GetOverview)
	r.Get("/hourly", h.GetNationalHourly)
	r.Get("/daily", h.GetNationalDaily)

	return r
}
