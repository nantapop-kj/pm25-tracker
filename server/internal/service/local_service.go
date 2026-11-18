package service

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

const (
	defaultStationRadiusKm = 50
	stationFreshness       = 3 * time.Hour
	localHours             = 12
	localDays              = 7
	attributionStation     = "Air4Thai, Pollution Control Department"
)

type localService struct {
	stations interfaces.StationRepository
	readings interfaces.ReadingRepository
	radiusKm float64
	now      func() time.Time
}

func NewLocalService(
	stations interfaces.StationRepository,
	readings interfaces.ReadingRepository,
	radiusKm float64,
) interfaces.LocalService {
	if radiusKm <= 0 {
		radiusKm = defaultStationRadiusKm
	}

	return &localService{
		stations: stations,
		readings: readings,
		radiusKm: radiusKm,
		now:      time.Now,
	}
}

func RoundCoord(v float64) float64 {
	return math.Round(v*100) / 100
}

func (s *localService) fromStation(ctx context.Context, st model.StationWithLatest, km float64) (model.LocalAir, error) {
	now := s.now()
	readings, err := s.readings.GetByStationSince(ctx, st.ID, now.Truncate(time.Hour).Add(-(localHours-1)*time.Hour))
	if err != nil {
		return model.LocalAir{}, err
	}
	daily, err := s.readings.GetDailyStats(ctx, st.ID, helper.StartOfDayBangkok(now).AddDate(0, 0, -(localDays-1)))
	if err != nil {
		return model.LocalAir{}, err
	}

	result := model.LocalAir{
		Place: model.LocalPlace{
			Name:       st.NameEN,
			Area:       st.AreaEN,
			Country:    "Thailand",
			Lat:        st.Lat,
			Lon:        st.Lon,
			StationID:  st.ID,
			DistanceKm: helper.Ptr(helper.Round(km, 1)),
		},
		Timezone:         "Asia/Bangkok",
		UTCOffsetSeconds: 7 * 3600,
		Current:          st.Latest,
		Hourly:           make([]model.NationalHour, 0, len(readings)),
		Daily:            make([]model.NationalDay, 0, len(daily)),
		Attribution:      attributionStation,
	}

	for _, r := range readings {
		if r.PM25 != nil {
			result.Hourly = append(result.Hourly, model.NationalHour{Hour: r.MeasuredAt, AvgPM25: *r.PM25, Stations: 1})
		}
	}
	for _, d := range daily {
		result.Daily = append(result.Daily, model.NationalDay{
			Day: d.Day, MinPM25: d.MinPM25, AvgPM25: d.AvgPM25, MaxPM25: d.MaxPM25, Stations: d.Samples,
		})
	}
	return result, nil
}

func (s *localService) GetByLocation(ctx context.Context, lat, lon float64) (model.LocalAir, error) {
	if lat < -90 || lat > 90 || lon < -180 || lon > 180 {
		return model.LocalAir{}, fiber.NewError(fiber.StatusBadRequest,
			fmt.Sprintf("lat must be between -90 and 90 and lon between -180 and 180, got lat=%g lon=%g", lat, lon))
	}

	lat, lon = RoundCoord(lat), RoundCoord(lon)

	st, km, err := s.stations.GetNearestWithLatest(ctx, lat, lon, s.now().Add(-stationFreshness))
	if err != nil {
		return model.LocalAir{}, fmt.Errorf("find nearest station: %w", err)
	}

	if km > s.radiusKm {
		return model.LocalAir{}, fiber.NewError(fiber.StatusNotFound, fmt.Sprintf(
			"no Air4Thai station within %g km of this location (nearest reporting station is %.0f km away); coverage is limited to Thailand",
			s.radiusKm, km))
	}

	air, err := s.fromStation(ctx, st, km)
	if err != nil {
		return model.LocalAir{}, fmt.Errorf("load history of station %q: %w", st.ID, err)
	}

	return air, nil
}
