package model

import (
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/enums"
)

// Overview คือภาพรวมทั้งประเทศจากค่าล่าสุดของทุกสถานี
type Overview struct {
	GeneratedAt    time.Time
	LatestAt       *time.Time
	StationCount   int
	ReportingCount int
	AvgPM25        *float64
	LevelCounts    map[enums.PM25Level]int
	Worst          []StationWithLatest
	Best           []StationWithLatest
}

// NationalHour คือค่าเฉลี่ย PM2.5 ทั้งประเทศในชั่วโมงหนึ่ง
type NationalHour struct {
	Hour     time.Time
	AvgPM25  float64
	Stations int64
}

// NationalDay คือภาพรวมทั้งประเทศของวันหนึ่ง: ค่าเฉลี่ยรายวันของสถานีที่ต่ำสุด เฉลี่ย และสูงสุด
type NationalDay struct {
	Day      time.Time
	MinPM25  float64
	AvgPM25  float64
	MaxPM25  float64
	Stations int64
}

// IngestResult คือสรุปผลการรัน ETL หนึ่งรอบ
type IngestResult struct {
	Source    string
	Fetched   int
	Saved     int
	Skipped   int
	StartedAt time.Time
	Duration  time.Duration
}
