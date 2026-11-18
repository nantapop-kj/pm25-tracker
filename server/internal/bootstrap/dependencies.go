package bootstrap

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/nantapop-kj/pm25-tracker/server/config"
	"github.com/nantapop-kj/pm25-tracker/server/internal/db"
	"github.com/nantapop-kj/pm25-tracker/server/internal/handler"
	"github.com/nantapop-kj/pm25-tracker/server/internal/httpclient"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/repository"
	"github.com/nantapop-kj/pm25-tracker/server/internal/service"
)

type Repositories struct {
	Station interfaces.StationRepository
	Reading interfaces.ReadingRepository
	Source  interfaces.AirQualitySource
}

type Services struct {
	Station   interfaces.StationService
	Analytics interfaces.AnalyticsService
	Local     interfaces.LocalService
	Ingest    interfaces.IngestService
}

type Handlers struct {
	Station   interfaces.StationHandler
	Analytics interfaces.AnalyticsHandler
	Local     interfaces.LocalHandler
}

type Dependencies struct {
	Config       *config.Config
	DB           *sql.DB
	Repositories Repositories
	Services     Services
	Handlers     Handlers
}

func InitDependencies() (*Dependencies, error) {
	cfg := config.Load()

	database, err := db.Connect(cfg.Postgres)
	if err != nil {
		return nil, err
	}
	log.Printf("postgres connected: %s:%s/%s", cfg.Postgres.Host, cfg.Postgres.Port, cfg.Postgres.Database)

	client, err := httpclient.New(cfg.HttpTimeout)
	if err != nil {
		database.Close()
		return nil, fmt.Errorf("http client: %w", err)
	}

	// ---- repository ----
	repos := Repositories{
		Station: repository.NewStationRepository(database),
		Reading: repository.NewReadingRepository(database),
		Source:  repository.NewAir4ThaiSource(cfg.Air4ThaiUrl, client),
	}

	// ---- service ----
	services := Services{
		Station:   service.NewStationService(repos.Station, repos.Reading),
		Analytics: service.NewAnalyticsService(repos.Station, repos.Reading),
		Local:     service.NewLocalService(repos.Station, repos.Reading, cfg.LocalStationRadiusKm),
		Ingest:    service.NewIngestService(repos.Source, repos.Station, repos.Reading),
	}

	// ---- handler ----
	handlers := Handlers{
		Station:   handler.NewStationHandler(services.Station),
		Analytics: handler.NewAnalyticsHandler(services.Analytics),
		Local:     handler.NewLocalHandler(services.Local),
	}

	return &Dependencies{
		Config:       cfg,
		DB:           database,
		Repositories: repos,
		Services:     services,
		Handlers:     handlers,
	}, nil
}

func (d *Dependencies) Close() error {
	if d.DB != nil {
		return d.DB.Close()
	}
	return nil
}
