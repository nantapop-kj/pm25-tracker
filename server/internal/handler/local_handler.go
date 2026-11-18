package handler

import (
	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/dto"
	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

type localHandler struct {
	svc interfaces.LocalService
}

func NewLocalHandler(svc interfaces.LocalService) interfaces.LocalHandler {
	return &localHandler{svc: svc}
}

func (h *localHandler) GetByLocation(c *fiber.Ctx) error {
	lat, err := helper.QueryFloatRequired(c, "lat", -90, 90)
	if err != nil {
		return err
	}

	lon, err := helper.QueryFloatRequired(c, "lon", -180, 180)
	if err != nil {
		return err
	}

	air, err := h.svc.GetByLocation(c.UserContext(), lat, lon)
	if err != nil {
		return err
	}

	pm25 := helper.RoundPtr(air.Current.PM25, 1)
	current := dto.ReadingDTO{
		MeasuredAt: air.Current.MeasuredAt,
		PM25:       pm25,
		PM10:       helper.RoundPtr(air.Current.PM10, 0),
		O3:         helper.RoundPtr(air.Current.O3, 0),
		CO:         helper.RoundPtr(air.Current.CO, 2),
		NO2:        helper.RoundPtr(air.Current.NO2, 0),
		SO2:        helper.RoundPtr(air.Current.SO2, 0),
		AQI:        air.Current.AQI,
		Level:      helper.PM25ToLevel(pm25),
	}

	hourly := make([]dto.NationalHourDTO, 0, len(air.Hourly))
	for _, x := range air.Hourly {
		avg := helper.Round(x.AvgPM25, 1)
		hourly = append(hourly, dto.NationalHourDTO{
			Hour:     x.Hour,
			AvgPM25:  avg,
			Stations: x.Stations,
			Level:    helper.PM25ToLevel(&avg),
		})
	}

	daily := make([]dto.NationalDayDTO, 0, len(air.Daily))
	for _, x := range air.Daily {
		avg := helper.Round(x.AvgPM25, 1)
		daily = append(daily, dto.NationalDayDTO{
			Day:      x.Day.Format("2006-01-02"),
			MinPM25:  helper.Round(x.MinPM25, 1),
			AvgPM25:  avg,
			MaxPM25:  helper.Round(x.MaxPM25, 1),
			Stations: x.Stations,
			Level:    helper.PM25ToLevel(&avg),
		})
	}

	c.Set(fiber.HeaderCacheControl, "private, max-age=600")
	return c.Status(fiber.StatusOK).JSON(dto.Response{
		Status: dto.StatusOK,
		Code:   fiber.StatusOK,
		Data: dto.LocalAirDTO{
			Place: dto.LocalPlaceDTO{
				Name:       air.Place.Name,
				Area:       air.Place.Area,
				Country:    air.Place.Country,
				Lat:        air.Place.Lat,
				Lon:        air.Place.Lon,
				StationID:  air.Place.StationID,
				DistanceKm: air.Place.DistanceKm,
			},
			Timezone:         air.Timezone,
			UTCOffsetSeconds: air.UTCOffsetSeconds,
			Current:          current,
			Hourly:           hourly,
			Daily:            daily,
			Attribution:      air.Attribution,
		},
	})
}
