package model

import "time"

// Reading คือค่าที่วัดได้ของสถานีหนึ่ง ณ ชั่วโมงหนึ่ง
// ค่าเป็น pointer เพราะบางสถานีไม่ได้วัดทุกมลพิษ (nil = ไม่มีข้อมูล)
// ค่าที่เป็น nil ข้ามการ validate (omitempty) ส่วนค่าที่มีต้องอยู่ในช่วงที่เครื่องวัดให้ได้จริง
type Reading struct {
	StationID  string    `json:"station_id" db:"station_id" validate:"required,alphanum,max=20"`
	MeasuredAt time.Time `json:"measured_at" db:"measured_at" validate:"required"`
	PM25       *float64  `json:"pm25" db:"pm25" validate:"omitempty,min=0,max=1000"` // µg/m³
	PM10       *float64  `json:"pm10" db:"pm10" validate:"omitempty,min=0,max=2000"` // µg/m³
	O3         *float64  `json:"o3" db:"o3" validate:"omitempty,min=0,max=500"`      // ppb
	CO         *float64  `json:"co" db:"co" validate:"omitempty,min=0,max=50"`       // ppm
	NO2        *float64  `json:"no2" db:"no2" validate:"omitempty,min=0,max=1000"`   // ppb
	SO2        *float64  `json:"so2" db:"so2" validate:"omitempty,min=0,max=1000"`   // ppb
	AQI        *int      `json:"aqi" db:"aqi" validate:"omitempty,min=0,max=500"`
}

// DailyStat คือสถิติ PM2.5 รายวันของสถานีหนึ่ง
type DailyStat struct {
	Day       time.Time
	AvgPM25   float64
	MinPM25   float64
	MaxPM25   float64
	Samples   int64
	Rolling7d float64
}
