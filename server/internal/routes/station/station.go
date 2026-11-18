package station

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

func Route(h interfaces.StationHandler) *fiber.App {
	r := fiber.New()

	r.Get("/", h.GetAll)
	r.Get("/:id", h.GetByID)
	r.Get("/:id/readings", h.GetReadings)
	r.Get("/:id/daily", h.GetDailyStats)

	return r
}
