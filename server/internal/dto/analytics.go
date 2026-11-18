package dto

import (
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/enums"
)

type OverviewDTO struct {
	GeneratedAt    time.Time               `json:"generatedAt"`
	LatestAt       *time.Time              `json:"latestAt"`
	StationCount   int                     `json:"stationCount"`
	ReportingCount int                     `json:"reportingCount"`
	AvgPM25        *float64                `json:"avgPm25"`
	LevelCounts    map[enums.PM25Level]int `json:"levelCounts"`
	Worst          []StationDTO            `json:"worst"`
	Best           []StationDTO            `json:"best"`
}

type NationalHourDTO struct {
	Hour     time.Time       `json:"hour"`
	AvgPM25  float64         `json:"avgPm25"`
	Stations int64           `json:"stations"`
	Level    enums.PM25Level `json:"level"`
}

type NationalDayDTO struct {
	Day      string          `json:"day"` // YYYY-MM-DD
	MinPM25  float64         `json:"minPm25"`
	AvgPM25  float64         `json:"avgPm25"`
	MaxPM25  float64         `json:"maxPm25"`
	Stations int64           `json:"stations"`
	Level    enums.PM25Level `json:"level"`
}
