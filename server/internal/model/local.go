package model

// LocalPlace คือสถานี Air4Thai ที่ใกล้ตำแหน่งผู้ใช้ที่สุด
type LocalPlace struct {
	Name       string
	Area       string
	Country    string
	Lat        float64
	Lon        float64
	StationID  string
	DistanceKm *float64
}

// LocalAir คือคุณภาพอากาศ ณ ตำแหน่งของผู้ใช้ จากสถานีที่ใกล้ที่สุด
type LocalAir struct {
	Place            LocalPlace
	Timezone         string
	UTCOffsetSeconds int
	Current          Reading
	Hourly           []NationalHour // PM2.5 รายชั่วโมงย้อนหลังของสถานีนั้น
	Daily            []NationalDay  // ต่ำสุด/เฉลี่ย/สูงสุดรายวันของสถานีนั้น
	Attribution      string
}
