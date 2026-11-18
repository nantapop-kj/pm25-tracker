package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type stationRepository struct {
	db *sql.DB
}

func NewStationRepository(db *sql.DB) interfaces.StationRepository {
	return &stationRepository{db: db}
}

func (r *stationRepository) UpsertMany(ctx context.Context, stations []model.Station) error {
	query := `
		INSERT INTO stations (id, name_th, name_en, area_th, area_en, station_type, lat, lon, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
		ON CONFLICT (id) DO UPDATE SET
			name_th      = EXCLUDED.name_th,
			name_en      = EXCLUDED.name_en,
			area_th      = EXCLUDED.area_th,
			area_en      = EXCLUDED.area_en,
			station_type = EXCLUDED.station_type,
			lat          = EXCLUDED.lat,
			lon          = EXCLUDED.lon,
			updated_at   = now()
	`

	return withTx(ctx, r.db, func(tx *sql.Tx) error {
		stmt, err := tx.PrepareContext(ctx, query)
		if err != nil {
			return fmt.Errorf("prepare station upsert: %w", err)
		}
		defer stmt.Close()

		for _, s := range stations {
			if _, err := stmt.ExecContext(ctx,
				s.ID,
				s.NameTH,
				s.NameEN,
				s.AreaTH,
				s.AreaEN,
				s.StationType,
				s.Lat,
				s.Lon,
			); err != nil {
				return fmt.Errorf("upsert station %q: %w", s.ID, err)
			}
		}
		return nil
	})
}

func (r *stationRepository) GetAllWithLatest(ctx context.Context) ([]model.StationWithLatest, error) {
	query := `
		SELECT
			s.id,
			s.name_th,
			s.name_en,
			s.area_th,
			s.area_en,
			s.station_type,
			s.lat,
			s.lon,
			r.measured_at,
			r.pm25,
			r.pm10,
			r.o3,
			r.co,
			r.no2,
			r.so2,
			r.aqi
		FROM stations s
		JOIN LATERAL (
			SELECT measured_at, pm25, pm10, o3, co, no2, so2, aqi
			FROM readings
			WHERE readings.station_id = s.id
			ORDER BY measured_at DESC
			LIMIT 1
		) r ON TRUE
		ORDER BY s.id
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query stations with latest reading: %w", err)
	}
	defer rows.Close()

	result := make([]model.StationWithLatest, 0)
	for rows.Next() {
		var (
			st                           model.StationWithLatest
			pm25, pm10, o3, co, no2, so2 sql.NullFloat64
			aqi                          sql.NullInt32
		)
		if err := rows.Scan(
			&st.ID,
			&st.NameTH,
			&st.NameEN,
			&st.AreaTH,
			&st.AreaEN,
			&st.StationType,
			&st.Lat,
			&st.Lon,
			&st.Latest.MeasuredAt,
			&pm25,
			&pm10,
			&o3,
			&co,
			&no2,
			&so2,
			&aqi,
		); err != nil {
			return nil, fmt.Errorf("scan station row: %w", err)
		}

		st.Latest.StationID = st.ID
		st.Latest.PM25 = helper.FloatPtr(pm25)
		st.Latest.PM10 = helper.FloatPtr(pm10)
		st.Latest.O3 = helper.FloatPtr(o3)
		st.Latest.CO = helper.FloatPtr(co)
		st.Latest.NO2 = helper.FloatPtr(no2)
		st.Latest.SO2 = helper.FloatPtr(so2)
		st.Latest.AQI = helper.IntPtr(aqi)

		result = append(result, st)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read station rows: %w", err)
	}

	return result, nil
}

func (r *stationRepository) GetByIDWithLatest(ctx context.Context, id string) (model.StationWithLatest, error) {
	query := `
		SELECT
			s.id,
			s.name_th,
			s.name_en,
			s.area_th,
			s.area_en,
			s.station_type,
			s.lat,
			s.lon,
			r.measured_at,
			r.pm25,
			r.pm10,
			r.o3,
			r.co,
			r.no2,
			r.so2,
			r.aqi
		FROM stations s
		JOIN LATERAL (
			SELECT measured_at, pm25, pm10, o3, co, no2, so2, aqi
			FROM readings
			WHERE readings.station_id = s.id
			ORDER BY measured_at DESC
			LIMIT 1
		) r ON TRUE
		WHERE s.id = $1
	`

	var (
		st                           model.StationWithLatest
		pm25, pm10, o3, co, no2, so2 sql.NullFloat64
		aqi                          sql.NullInt32
	)
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&st.ID,
		&st.NameTH,
		&st.NameEN,
		&st.AreaTH,
		&st.AreaEN,
		&st.StationType,
		&st.Lat,
		&st.Lon,
		&st.Latest.MeasuredAt,
		&pm25,
		&pm10,
		&o3,
		&co,
		&no2,
		&so2,
		&aqi,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return model.StationWithLatest{}, fiber.NewError(fiber.StatusNotFound,
			fmt.Sprintf("station %q not found or has no readings yet", id))
	}
	if err != nil {
		return model.StationWithLatest{}, fmt.Errorf("query station %q: %w", id, err)
	}

	st.Latest.StationID = st.ID
	st.Latest.PM25 = helper.FloatPtr(pm25)
	st.Latest.PM10 = helper.FloatPtr(pm10)
	st.Latest.O3 = helper.FloatPtr(o3)
	st.Latest.CO = helper.FloatPtr(co)
	st.Latest.NO2 = helper.FloatPtr(no2)
	st.Latest.SO2 = helper.FloatPtr(so2)
	st.Latest.AQI = helper.IntPtr(aqi)

	return st, nil
}

func (r *stationRepository) GetNearestWithLatest(ctx context.Context, lat, lon float64, freshSince time.Time) (model.StationWithLatest, float64, error) {
	query := `
		SELECT
			s.id,
			s.name_th,
			s.name_en,
			s.area_th,
			s.area_en,
			s.station_type,
			s.lat,
			s.lon,
			r.measured_at,
			r.pm25,
			r.pm10,
			r.o3,
			r.co,
			r.no2,
			r.so2,
			r.aqi,
			d.distance_m
		FROM stations s
		JOIN LATERAL (
			SELECT measured_at, pm25, pm10, o3, co, no2, so2, aqi
			FROM readings
			WHERE readings.station_id = s.id
			  AND readings.pm25 IS NOT NULL
			  AND readings.measured_at >= $3
			ORDER BY measured_at DESC
			LIMIT 1
		) r ON TRUE
		CROSS JOIN LATERAL (
			SELECT 2 * 6371000 * asin(least(1, sqrt(
				power(sin(radians(s.lat - $1::float8) / 2), 2) +
				cos(radians($1::float8)) * cos(radians(s.lat)) *
				power(sin(radians(s.lon - $2::float8) / 2), 2)
			))) AS distance_m
		) d
		ORDER BY d.distance_m
		LIMIT 1
	`

	var (
		st                           model.StationWithLatest
		pm25, pm10, o3, co, no2, so2 sql.NullFloat64
		aqi                          sql.NullInt32
		distanceM                    float64
	)
	err := r.db.QueryRowContext(ctx, query, lat, lon, freshSince).Scan(
		&st.ID,
		&st.NameTH,
		&st.NameEN,
		&st.AreaTH,
		&st.AreaEN,
		&st.StationType,
		&st.Lat,
		&st.Lon,
		&st.Latest.MeasuredAt,
		&pm25,
		&pm10,
		&o3,
		&co,
		&no2,
		&so2,
		&aqi,
		&distanceM,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return model.StationWithLatest{}, 0, fiber.NewError(fiber.StatusNotFound,
			fmt.Sprintf("no Air4Thai station has reported PM2.5 since %s (Asia/Bangkok)",
				freshSince.In(helper.Bangkok).Format("2006-01-02 15:04")))
	}
	if err != nil {
		return model.StationWithLatest{}, 0, fmt.Errorf("query nearest station: %w", err)
	}

	st.Latest.StationID = st.ID
	st.Latest.PM25 = helper.FloatPtr(pm25)
	st.Latest.PM10 = helper.FloatPtr(pm10)
	st.Latest.O3 = helper.FloatPtr(o3)
	st.Latest.CO = helper.FloatPtr(co)
	st.Latest.NO2 = helper.FloatPtr(no2)
	st.Latest.SO2 = helper.FloatPtr(so2)
	st.Latest.AQI = helper.IntPtr(aqi)

	return st, distanceM / 1000, nil
}
