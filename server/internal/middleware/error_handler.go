package middleware

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/dto"
)

// ErrorHandler แปลง error ที่ handler คืนมาเป็น HTTP status + JSON {"error": "..."}
//   - *fiber.Error (fiber.NewError) → ใช้ status และข้อความตามที่สร้างไว้ (ห่อด้วย fmt.Errorf %w ได้)
//   - หมดเวลา                      → 504
//   - อื่น ๆ                       → 500 ข้อความกลาง ๆ (รายละเอียดเขียนลง log เท่านั้น ไม่ส่งให้ผู้ใช้)
func ErrorHandler(c *fiber.Ctx, err error) error {
	status, message := resolve(c, err)
	if status >= fiber.StatusInternalServerError {
		log.Printf("%s %s -> %d: %v", c.Method(), c.Path(), status, err)
	}
	return c.Status(status).JSON(dto.Response{
		Status: dto.StatusError,
		Code:   status,
		Error:  message,
	})
}

func resolve(c *fiber.Ctx, err error) (int, string) {
	var fe *fiber.Error
	if errors.As(err, &fe) {
		switch {
		// 404 ที่ router ของ Fiber สร้างเอง (ไม่มี route นี้) ข้อความเดิมคือ "Cannot GET /path"
		case fe.Code == fiber.StatusNotFound && strings.HasPrefix(fe.Message, "Cannot "+c.Method()+" "):
			return fe.Code, fmt.Sprintf("route %s %s does not exist", c.Method(), c.Path())
		case fe.Code == fiber.StatusMethodNotAllowed:
			return fe.Code, fmt.Sprintf("method %s is not allowed on %s", c.Method(), c.Path())
		case fe.Code >= fiber.StatusInternalServerError:
			return fe.Code, "unexpected server error, please try again later"
		default:
			return fe.Code, fe.Message
		}
	}

	if errors.Is(err, context.DeadlineExceeded) {
		return fiber.StatusGatewayTimeout, "the server took too long to respond, please try again"
	}

	return fiber.StatusInternalServerError, "unexpected server error, please try again later"
}
