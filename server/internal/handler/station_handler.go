package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/dto"
	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

type stationHandler struct {
	svc interfaces.StationService
}

func NewStationHandler(svc interfaces.StationService) interfaces.StationHandler {
	return &stationHandler{svc: svc}
}

func (h *stationHandler) GetAll(c *fiber.Ctx) error {
	stations, err := h.svc.GetAll(c.UserContext())
	if err != nil {
		return err
	}

	data := make([]dto.StationDTO, 0, len(stations))
	for _, s := range stations {
		data = append(data, dto.StationDTO{
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
		Data:   data,
	})
}

func (h *stationHandler) GetByID(c *fiber.Ctx) error {
	s, err := h.svc.GetByID(c.UserContext(), c.Params("id"))
	if err != nil {
		return err
	}

	data := dto.StationDTO{
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
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data:   data,
	})
}

func (h *stationHandler) GetReadings(c *fiber.Ctx) error {
	hours, err := helper.QueryInt(c, "hours", 72, 1, 24*31)
	if err != nil {
		return err
	}
	readings, err := h.svc.GetReadings(c.UserContext(), c.Params("id"), hours)
	if err != nil {
		return err
	}

	data := make([]dto.ReadingDTO, 0, len(readings))
	for _, r := range readings {
		data = append(data, dto.ReadingDTO{
			MeasuredAt: r.MeasuredAt,
			PM25:       r.PM25,
			PM10:       r.PM10,
			O3:         r.O3,
			CO:         r.CO,
			NO2:        r.NO2,
			SO2:        r.SO2,
			AQI:        r.AQI,
			Level:      helper.PM25ToLevel(r.PM25),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data:   data,
	})
}

func (h *stationHandler) GetDailyStats(c *fiber.Ctx) error {
	days, err := helper.QueryInt(c, "days", 30, 1, 365)
	if err != nil {
		return err
	}

	stats, err := h.svc.GetDailyStats(c.UserContext(), c.Params("id"), days)
	if err != nil {
		return err
	}

	data := make([]dto.DailyStatDTO, 0, len(stats))
	for _, d := range stats {
		avg := helper.Round(d.AvgPM25, 1)
		data = append(data, dto.DailyStatDTO{
			Day:       d.Day.Format("2006-01-02"),
			AvgPM25:   avg,
			MinPM25:   helper.Round(d.MinPM25, 1),
			MaxPM25:   helper.Round(d.MaxPM25, 1),
			Samples:   d.Samples,
			Rolling7d: helper.Round(d.Rolling7d, 1),
			Level:     helper.PM25ToLevel(&avg),
		})
	}

	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data:   data,
	})
}
