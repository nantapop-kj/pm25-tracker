package interfaces

import "github.com/gofiber/fiber/v2"

type StationHandler interface {
	GetAll(c *fiber.Ctx) error
	GetByID(c *fiber.Ctx) error
	GetReadings(c *fiber.Ctx) error
	GetDailyStats(c *fiber.Ctx) error
}

type AnalyticsHandler interface {
	GetOverview(c *fiber.Ctx) error
	GetNationalHourly(c *fiber.Ctx) error
	GetNationalDaily(c *fiber.Ctx) error
}

type LocalHandler interface {
	GetByLocation(c *fiber.Ctx) error
}
