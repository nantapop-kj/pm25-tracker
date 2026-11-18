package model

// Station คือสถานีตรวจวัดคุณภาพอากาศ
type Station struct {
	ID          string  `json:"id" db:"id" validate:"required,alphanum,max=20"`
	NameTH      string  `json:"name_th" db:"name_th" validate:"required,max=255"`
	NameEN      string  `json:"name_en" db:"name_en" validate:"required,max=255"`
	AreaTH      string  `json:"area_th" db:"area_th" validate:"max=255"`
	AreaEN      string  `json:"area_en" db:"area_en" validate:"max=255"`
	StationType string  `json:"station_type" db:"station_type" validate:"max=50"`
	Lat         float64 `json:"lat" db:"lat" validate:"min=-90,max=90"`
	Lon         float64 `json:"lon" db:"lon" validate:"min=-180,max=180"`
}

// StationWithLatest คือสถานีพร้อมค่าที่วัดได้ล่าสุด
type StationWithLatest struct {
	Station
	Latest Reading
}

// StationReading คือข้อมูลดิบหนึ่งรายการจากแหล่งข้อมูล (สถานี + ค่าล่าสุด)
type StationReading struct {
	Station Station
	Reading Reading
}
