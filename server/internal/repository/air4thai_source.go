package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type air4ThaiSource struct {
	url    string
	client *http.Client
}

func NewAir4ThaiSource(url string, client *http.Client) interfaces.AirQualitySource {
	return &air4ThaiSource{
		url:    url,
		client: client,
	}
}

func (s *air4ThaiSource) Name() string { return "air4thai" }

func (s *air4ThaiSource) GetLatest(ctx context.Context) ([]model.StationReading, error) {
	if s.url == "" {
		return nil, errors.New("air4thai: AIR4THAI_URL is not set, cannot fetch air quality data")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.url, nil)
	if err != nil {
		return nil, fmt.Errorf("air4thai: build request for %q (check AIR4THAI_URL): %w", s.url, err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "pm25-tracker/1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("air4thai: request to %s failed (network error or timeout): %w", s.url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("air4thai: %s responded with HTTP %s", s.url, resp.Status)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 20<<20))
	if err != nil {
		return nil, fmt.Errorf("air4thai: read response body: %w", err)
	}

	return ParseAir4Thai(body)
}

type air4ThaiResponse struct {
	Stations []air4ThaiStation `json:"stations"`
}

type air4ThaiStation struct {
	StationID   string         `json:"stationID"`
	NameTH      string         `json:"nameTH"`
	NameEN      string         `json:"nameEN"`
	AreaTH      string         `json:"areaTH"`
	AreaEN      string         `json:"areaEN"`
	StationType string         `json:"stationType"`
	Lat         flexNumber     `json:"lat"`
	Long        flexNumber     `json:"long"`
	AQILast     air4ThaiLatest `json:"AQILast"`
}

type air4ThaiLatest struct {
	Date string        `json:"date"` // 2006-01-02
	Time string        `json:"time"` // 15:04
	PM25 air4ThaiValue `json:"PM25"`
	PM10 air4ThaiValue `json:"PM10"`
	O3   air4ThaiValue `json:"O3"`
	CO   air4ThaiValue `json:"CO"`
	NO2  air4ThaiValue `json:"NO2"`
	SO2  air4ThaiValue `json:"SO2"`
	AQI  air4ThaiValue `json:"AQI"`
}

type air4ThaiValue struct {
	Value flexNumber `json:"value"`
	AQI   flexNumber `json:"aqi"`
}

type flexNumber struct{ v *float64 }

func (f *flexNumber) UnmarshalJSON(b []byte) error {
	s := strings.Trim(strings.TrimSpace(string(b)), `"`)

	switch s {
	case "", "null", "-", "N/A", "n/a", "NA":
		return nil
	}

	x, err := strconv.ParseFloat(s, 64)
	if err != nil || x < 0 {
		return nil
	}

	f.v = &x

	return nil
}

func ParseAir4Thai(body []byte) ([]model.StationReading, error) {
	var payload air4ThaiResponse
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, fmt.Errorf("air4thai: response is not the expected JSON (service may be under maintenance): %w", err)
	}

	result := make([]model.StationReading, 0, len(payload.Stations))
	for _, st := range payload.Stations {
		id := strings.TrimSpace(st.StationID)
		if id == "" || st.Lat.v == nil || st.Long.v == nil {
			continue
		}
		measuredAt, err := time.ParseInLocation("2006-01-02 15:04",
			strings.TrimSpace(st.AQILast.Date)+" "+strings.TrimSpace(st.AQILast.Time), helper.Bangkok)
		if err != nil {
			continue
		}

		var aqi *int
		if st.AQILast.AQI.AQI.v != nil {
			aqi = helper.Ptr(int(*st.AQILast.AQI.AQI.v))
		}

		result = append(result, model.StationReading{
			Station: model.Station{
				ID:          id,
				NameTH:      strings.TrimSpace(st.NameTH),
				NameEN:      strings.TrimSpace(st.NameEN),
				AreaTH:      strings.TrimSpace(st.AreaTH),
				AreaEN:      strings.TrimSpace(st.AreaEN),
				StationType: strings.TrimSpace(st.StationType),
				Lat:         *st.Lat.v,
				Lon:         *st.Long.v,
			},
			Reading: model.Reading{
				StationID:  id,
				MeasuredAt: measuredAt,
				PM25:       st.AQILast.PM25.Value.v,
				PM10:       st.AQILast.PM10.Value.v,
				O3:         st.AQILast.O3.Value.v,
				CO:         st.AQILast.CO.Value.v,
				NO2:        st.AQILast.NO2.Value.v,
				SO2:        st.AQILast.SO2.Value.v,
				AQI:        aqi,
			},
		})
	}

	return result, nil
}
