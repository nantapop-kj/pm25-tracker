package helper

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func QueryInt(c *fiber.Ctx, key string, fallback, min, max int) (int, error) {
	raw := c.Query(key)
	if raw == "" {
		return fallback, nil
	}

	n, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("query parameter %q must be a whole number, got %q", key, raw))
	}

	if n < min || n > max {
		return 0, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("query parameter %q must be between %d and %d, got %d", key, min, max, n))
	}

	return n, nil
}

func QueryFloatRequired(c *fiber.Ctx, key string, min, max float64) (float64, error) {
	raw := c.Query(key)
	if raw == "" {
		return 0, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("query parameter %q is required", key))
	}

	f, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return 0, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("query parameter %q must be a number, got %q", key, raw))
	}

	if f < min || f > max {
		return 0, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("query parameter %q must be between %g and %g, got %g", key, min, max, f))
	}

	return f, nil
}
