package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/dto"
	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

type analyticsHandler struct {
	svc interfaces.AnalyticsService
}

func NewAnalyticsHandler(svc interfaces.AnalyticsService) interfaces.AnalyticsHandler {
	return &analyticsHandler{svc: svc}
}

func (h *analyticsHandler) GetOverview(c *fiber.Ctx) error {
	ov, err := h.svc.GetOverview(c.UserContext())
	if err != nil {
		return err
	}

	worst := make([]dto.StationDTO, 0, len(ov.Worst))
	for _, s := range ov.Worst {
		worst = append(worst, dto.StationDTO{
			ID:          s.ID,
			NameTH:      s.NameTH,
			NameEN:      s.NameEN,
			AreaTH:      s.AreaTH,
			AreaEN:      s.AreaEN,
			StationType: s.StationType,
			Lat:         s.Lat,
			Lon:         s.Lon,
			Latest: dto.ReadingDTO{
				MeasuredAt: s.Latest.MeasuredAt,
				PM25:       s.Latest.PM25,
				PM10:       s.Latest.PM10,
				O3:         s.Latest.O3,
				CO:         s.Latest.CO,
				NO2:        s.Latest.NO2,
				SO2:        s.Latest.SO2,
				AQI:        s.Latest.AQI,
				Level:      helper.PM25ToLevel(s.Latest.PM25),
			},
		})
	}

	best := make([]dto.StationDTO, 0, len(ov.Best))
	for _, s := range ov.Best {
		best = append(best, dto.StationDTO{
			ID:          s.ID,
			NameTH:      s.NameTH,
			NameEN:      s.NameEN,
			AreaTH:      s.AreaTH,
			AreaEN:      s.AreaEN,
			StationType: s.StationType,
			Lat:         s.Lat,
			Lon:         s.Lon,
			Latest: dto.ReadingDTO{
				MeasuredAt: s.Latest.MeasuredAt,
				PM25:       s.Latest.PM25,
				PM10:       s.Latest.PM10,
				O3:         s.Latest.O3,
				CO:         s.Latest.CO,
				NO2:        s.Latest.NO2,
				SO2:        s.Latest.SO2,
				AQI:        s.Latest.AQI,
				Level:      helper.PM25ToLevel(s.Latest.PM25),
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data: dto.OverviewDTO{
			GeneratedAt:    ov.GeneratedAt,
			LatestAt:       ov.LatestAt,
			StationCount:   ov.StationCount,
			ReportingCount: ov.ReportingCount,
			AvgPM25:        ov.AvgPM25,
			LevelCounts:    ov.LevelCounts,
			Worst:          worst,
			Best:           best,
		},
	})
}

func (h *analyticsHandler) GetNationalHourly(c *fiber.Ctx) error {
	hours, err := helper.QueryInt(c, "hours", 12, 1, 24*7)
	if err != nil {
		return err
	}
	rows, err := h.svc.GetNationalHourly(c.UserContext(), hours)
	if err != nil {
		return err
	}

	data := make([]dto.NationalHourDTO, 0, len(rows))
	for _, x := range rows {
		avg := helper.Round(x.AvgPM25, 1)
		data = append(data, dto.NationalHourDTO{
			Hour:     x.Hour,
			AvgPM25:  avg,
			Stations: x.Stations,
			Level:    helper.PM25ToLevel(&avg),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data:   data,
	})
}

func (h *analyticsHandler) GetNationalDaily(c *fiber.Ctx) error {
	days, err := helper.QueryInt(c, "days", 7, 1, 90)
	if err != nil {
		return err
	}
	rows, err := h.svc.GetNationalDaily(c.UserContext(), days)
	if err != nil {
		return err
	}

	data := make([]dto.NationalDayDTO, 0, len(rows))
	for _, x := range rows {
		avg := helper.Round(x.AvgPM25, 1)
		data = append(data, dto.NationalDayDTO{
			Day:      x.Day.Format("2006-01-02"),
			MinPM25:  helper.Round(x.MinPM25, 1),
			AvgPM25:  avg,
			MaxPM25:  helper.Round(x.MaxPM25, 1),
			Stations: x.Stations,
			Level:    helper.PM25ToLevel(&avg),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data:   data,
	})
}
