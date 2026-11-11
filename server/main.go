package main

import (
	"context"
	"log"

	"github.com/nantapop-kj/pm25-tracker/server/config"
	"github.com/nantapop-kj/pm25-tracker/server/db"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	pool, err := db.Connect(ctx, cfg.Postgres)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	log.Printf("%s (%s) connected to postgres %s:%s/%s", cfg.AppName, cfg.AppEnv, cfg.Postgres.Host, cfg.Postgres.Port, cfg.Postgres.Database)
}
