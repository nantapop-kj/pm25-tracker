package service

import (
	"context"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type stationService struct {
	stations interfaces.StationRepository
	readings interfaces.ReadingRepository
	now      func() time.Time
}

func NewStationService(stations interfaces.StationRepository, readings interfaces.ReadingRepository) interfaces.StationService {
	return &stationService{stations: stations, readings: readings, now: time.Now}
}

func (s *stationService) GetAll(ctx context.Context) ([]model.StationWithLatest, error) {
	return s.stations.GetAllWithLatest(ctx)
}

func (s *stationService) GetByID(ctx context.Context, id string) (model.StationWithLatest, error) {
	return s.stations.GetByIDWithLatest(ctx, id)
}

func (s *stationService) GetReadings(ctx context.Context, id string, hours int) ([]model.Reading, error) {
	if _, err := s.stations.GetByIDWithLatest(ctx, id); err != nil {
		return nil, err
	}

	return s.readings.GetByStationSince(ctx, id, s.now().Add(-time.Duration(hours)*time.Hour))
}

func (s *stationService) GetDailyStats(ctx context.Context, id string, days int) ([]model.DailyStat, error) {
	if _, err := s.stations.GetByIDWithLatest(ctx, id); err != nil {
		return nil, err
	}

	return s.readings.GetDailyStats(ctx, id, helper.StartOfDayBangkok(s.now()).AddDate(0, 0, -(days-1)))
}
