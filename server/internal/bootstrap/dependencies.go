package bootstrap

import (
	"database/sql"
	"log"

	"github.com/nantapop-kj/pm25-tracker/server/config"
	"github.com/nantapop-kj/pm25-tracker/server/internal/db"
)

type Dependencies struct {
	Config *config.Config
	DB     *sql.DB
}

func InitDependencies() (*Dependencies, error) {
	cfg := config.Load()

	database, err := db.Connect(cfg.Postgres)
	if err != nil {
		return nil, err
	}
	log.Printf("postgres connected: %s:%s/%s", cfg.Postgres.Host, cfg.Postgres.Port, cfg.Postgres.Database)

	return &Dependencies{
		Config: cfg,
		DB:     database,
	}, nil
}

func (d *Dependencies) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
