package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/nantapop-kj/pm25-tracker/server/internal/bootstrap"
	"github.com/nantapop-kj/pm25-tracker/server/internal/middleware"
	"github.com/nantapop-kj/pm25-tracker/server/internal/routes"
)

func main() {
	deps, err := bootstrap.InitDependencies()
	if err != nil {
		log.Fatal(err)
	}
	defer deps.Close()

	app := fiber.New(fiber.Config{
		AppName: deps.Config.AppName,
	})
	app.Use(recover.New())
	app.Use(middleware.CORS(deps.Config.CorsOrigins))
	routes.RegisterRoutes(app, deps)

	log.Fatal(app.Listen(":" + deps.Config.ServerPort))
}
