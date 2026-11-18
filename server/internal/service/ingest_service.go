package service

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type ingestService struct {
	source   interfaces.AirQualitySource
	stations interfaces.StationRepository
	readings interfaces.ReadingRepository
	now      func() time.Time
}

func NewIngestService(
	source interfaces.AirQualitySource,
	stations interfaces.StationRepository,
	readings interfaces.ReadingRepository,
) interfaces.IngestService {
	return &ingestService{
		source:   source,
		stations: stations,
		readings: readings,
		now:      time.Now,
	}
}

func (s *ingestService) IngestAirQuality(ctx context.Context) (model.IngestResult, error) {
	res := model.IngestResult{Source: s.source.Name(), StartedAt: s.now()}

	raw, err := s.source.GetLatest(ctx)
	if err != nil {
		return res, fmt.Errorf("extract from %s: %w", res.Source, err)
	}

	res.Fetched = len(raw)

	stations, readings := CleanStationReadings(raw, s.now())
	res.Skipped = res.Fetched - len(readings)

	if err := s.stations.UpsertMany(ctx, stations); err != nil {
		return res, fmt.Errorf("save %d stations: %w", len(stations), err)
	}

	if err := s.readings.UpsertMany(ctx, readings); err != nil {
		return res, fmt.Errorf("save %d readings: %w", len(readings), err)
	}

	res.Saved = len(readings)
	res.Duration = time.Since(res.StartedAt)

	return res, nil
}

var validRange = struct{ pm25, pm10, o3, co, no2, so2 [2]float64 }{
	pm25: [2]float64{0, 1000},
	pm10: [2]float64{0, 2000},
	o3:   [2]float64{0, 500},
	co:   [2]float64{0, 50},
	no2:  [2]float64{0, 1000},
	so2:  [2]float64{0, 1000},
}

const (
	minLat, maxLat = 5.0, 21.0
	minLon, maxLon = 97.0, 106.0
)

func inRange(v *float64, r [2]float64) *float64 {
	if v == nil || *v < r[0] || *v > r[1] {
		return nil
	}

	return v
}

func CleanStationReadings(raw []model.StationReading, now time.Time) ([]model.Station, []model.Reading) {
	seen := make(map[string]bool, len(raw))
	stations := make([]model.Station, 0, len(raw))
	readings := make([]model.Reading, 0, len(raw))

	for _, sr := range raw {
		st := sr.Station
		if st.ID == "" || seen[st.ID] {
			continue
		}

		if st.Lat < minLat || st.Lat > maxLat || st.Lon < minLon || st.Lon > maxLon {
			continue
		}

		seen[st.ID] = true
		if st.NameEN == "" {
			st.NameEN = st.NameTH
		}

		if err := helper.Validate(st); err != nil {
			log.Printf("ingest: skip invalid station %q: %v", st.ID, err)
			continue
		}

		stations = append(stations, st)

		r := sr.Reading
		r.StationID = st.ID
		if r.MeasuredAt.IsZero() || r.MeasuredAt.After(now.Add(time.Hour)) {
			continue
		}

		r.PM25 = inRange(r.PM25, validRange.pm25)
		r.PM10 = inRange(r.PM10, validRange.pm10)
		r.O3 = inRange(r.O3, validRange.o3)
		r.CO = inRange(r.CO, validRange.co)
		r.NO2 = inRange(r.NO2, validRange.no2)
		r.SO2 = inRange(r.SO2, validRange.so2)

		if r.AQI != nil && (*r.AQI < 0 || *r.AQI > 500) {
			r.AQI = nil
		}

		if r.PM25 == nil && r.PM10 == nil && r.O3 == nil && r.CO == nil && r.NO2 == nil && r.SO2 == nil {
			continue
		}

		if err := helper.Validate(r); err != nil {
			log.Printf("ingest: skip invalid reading of station %q: %v", r.StationID, err)
			continue
		}

		readings = append(readings, r)
	}

	return stations, readings
}
