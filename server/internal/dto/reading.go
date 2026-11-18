package dto

import (
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/enums"
)

type ReadingDTO struct {
	MeasuredAt time.Time       `json:"measuredAt"`
	PM25       *float64        `json:"pm25"`
	PM10       *float64        `json:"pm10"`
	O3         *float64        `json:"o3"`
	CO         *float64        `json:"co"`
	NO2        *float64        `json:"no2"`
	SO2        *float64        `json:"so2"`
	AQI        *int            `json:"aqi"`
	Level      enums.PM25Level `json:"level"`
}

type DailyStatDTO struct {
	Day       string          `json:"day"` // YYYY-MM-DD
	AvgPM25   float64         `json:"avgPm25"`
	MinPM25   float64         `json:"minPm25"`
	MaxPM25   float64         `json:"maxPm25"`
	Samples   int64           `json:"samples"`
	Rolling7d float64         `json:"rolling7d"`
	Level     enums.PM25Level `json:"level"`
}
