package dto

type LocalPlaceDTO struct {
	Name       string   `json:"name"`
	Area       string   `json:"area"`
	Country    string   `json:"country"`
	Lat        float64  `json:"lat"`
	Lon        float64  `json:"lon"`
	StationID  string   `json:"stationId,omitempty"`
	DistanceKm *float64 `json:"distanceKm,omitempty"`
}

type LocalAirDTO struct {
	Place            LocalPlaceDTO     `json:"place"`
	Timezone         string            `json:"timezone"`
	UTCOffsetSeconds int               `json:"utcOffsetSeconds"`
	Current          ReadingDTO        `json:"current"`
	Hourly           []NationalHourDTO `json:"hourly"`
	Daily            []NationalDayDTO  `json:"daily"`
	Attribution      string            `json:"attribution"`
}
