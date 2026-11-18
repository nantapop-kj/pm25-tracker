// Package interfaces เก็บสัญญา (interface) ระหว่างชั้นต่าง ๆ
// ชั้น service รู้จักแค่ interface ในนี้ ไม่รู้ว่าข้างหลังเป็น Postgres หรือ API ภายนอก
package interfaces

import (
	"context"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type StationRepository interface {
	UpsertMany(ctx context.Context, stations []model.Station) error
	GetAllWithLatest(ctx context.Context) ([]model.StationWithLatest, error)
	GetByIDWithLatest(ctx context.Context, id string) (model.StationWithLatest, error)
	GetNearestWithLatest(ctx context.Context, lat, lon float64, freshSince time.Time) (model.StationWithLatest, float64, error)
}

type ReadingRepository interface {
	UpsertMany(ctx context.Context, readings []model.Reading) error
	GetByStationSince(ctx context.Context, stationID string, since time.Time) ([]model.Reading, error)
	GetDailyStats(ctx context.Context, stationID string, since time.Time) ([]model.DailyStat, error)
	GetNationalHourly(ctx context.Context, since time.Time) ([]model.NationalHour, error)
	GetNationalDaily(ctx context.Context, since time.Time) ([]model.NationalDay, error)
}

type AirQualitySource interface {
	Name() string
	GetLatest(ctx context.Context) ([]model.StationReading, error)
}
