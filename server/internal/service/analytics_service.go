package service

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/enums"
	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

const (
	reportingWindow = 3 * time.Hour
	rankingSize     = 10
)

type analyticsService struct {
	stations interfaces.StationRepository
	readings interfaces.ReadingRepository
	now      func() time.Time
}

func NewAnalyticsService(stations interfaces.StationRepository, readings interfaces.ReadingRepository) interfaces.AnalyticsService {
	return &analyticsService{stations: stations, readings: readings, now: time.Now}
}

func buildOverview(all []model.StationWithLatest, now time.Time) model.Overview {
	ov := model.Overview{
		GeneratedAt:  now,
		StationCount: len(all),
		LevelCounts:  make(map[enums.PM25Level]int, len(enums.AllPM25Levels)),
		Worst:        []model.StationWithLatest{},
		Best:         []model.StationWithLatest{},
	}
	for _, lv := range enums.AllPM25Levels {
		ov.LevelCounts[lv] = 0
	}

	var latest time.Time
	for _, st := range all {
		if st.Latest.MeasuredAt.After(latest) {
			latest = st.Latest.MeasuredAt
		}
	}
	if latest.IsZero() {
		ov.LevelCounts[enums.LevelUnknown] = len(all)
		return ov
	}
	ov.LatestAt = &latest

	var reporting []model.StationWithLatest
	var values []float64
	for _, st := range all {
		fresh := latest.Sub(st.Latest.MeasuredAt) <= reportingWindow
		if !fresh || st.Latest.PM25 == nil {
			ov.LevelCounts[enums.LevelUnknown]++
			continue
		}
		reporting = append(reporting, st)
		values = append(values, *st.Latest.PM25)
		ov.LevelCounts[helper.PM25ToLevel(st.Latest.PM25)]++
	}
	ov.ReportingCount = len(reporting)
	if len(values) > 0 {
		ov.AvgPM25 = helper.Ptr(helper.Round(helper.Mean(values), 1))
	}

	sort.SliceStable(reporting, func(i, j int) bool { return *reporting[i].Latest.PM25 > *reporting[j].Latest.PM25 })
	n := min(rankingSize, len(reporting))
	ov.Worst = append(ov.Worst, reporting[:n]...)
	for i := len(reporting) - 1; i >= len(reporting)-n; i-- {
		ov.Best = append(ov.Best, reporting[i])
	}

	return ov
}

func (s *analyticsService) GetNationalHourly(ctx context.Context, hours int) ([]model.NationalHour, error) {
	since := s.now().Truncate(time.Hour).Add(-time.Duration(hours-1) * time.Hour)

	return s.readings.GetNationalHourly(ctx, since)
}

func (s *analyticsService) GetNationalDaily(ctx context.Context, days int) ([]model.NationalDay, error) {
	return s.readings.GetNationalDaily(ctx, helper.StartOfDayBangkok(s.now()).AddDate(0, 0, -(days-1)))
}

func (s *analyticsService) GetOverview(ctx context.Context) (model.Overview, error) {
	all, err := s.stations.GetAllWithLatest(ctx)
	if err != nil {
		return model.Overview{}, fmt.Errorf("build overview: %w", err)
	}

	return buildOverview(all, s.now()), nil
}
