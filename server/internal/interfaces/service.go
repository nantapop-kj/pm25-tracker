package interfaces

import (
	"context"

	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type StationService interface {
	GetAll(ctx context.Context) ([]model.StationWithLatest, error)
	GetByID(ctx context.Context, id string) (model.StationWithLatest, error)
	GetReadings(ctx context.Context, id string, hours int) ([]model.Reading, error)
	GetDailyStats(ctx context.Context, id string, days int) ([]model.DailyStat, error)
}

type AnalyticsService interface {
	GetOverview(ctx context.Context) (model.Overview, error)
	GetNationalHourly(ctx context.Context, hours int) ([]model.NationalHour, error)
	GetNationalDaily(ctx context.Context, days int) ([]model.NationalDay, error)
}

type LocalService interface {
	GetByLocation(ctx context.Context, lat, lon float64) (model.LocalAir, error)
}

type IngestService interface {
	IngestAirQuality(ctx context.Context) (model.IngestResult, error)
}
