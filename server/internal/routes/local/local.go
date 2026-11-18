package local

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

func Route(h interfaces.LocalHandler) *fiber.App {
	r := fiber.New()

	r.Get("/", h.GetByLocation)

	return r
}
