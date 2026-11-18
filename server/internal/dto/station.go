package dto

type StationDTO struct {
	ID          string     `json:"id"`
	NameTH      string     `json:"nameTh"`
	NameEN      string     `json:"nameEn"`
	AreaTH      string     `json:"areaTh"`
	AreaEN      string     `json:"areaEn"`
	StationType string     `json:"stationType"`
	Lat         float64    `json:"lat"`
	Lon         float64    `json:"lon"`
	Latest      ReadingDTO `json:"latest"`
}
