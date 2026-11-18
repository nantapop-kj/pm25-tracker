package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
	"github.com/nantapop-kj/pm25-tracker/server/internal/model"
)

type readingRepository struct {
	db *sql.DB
}

func NewReadingRepository(db *sql.DB) interfaces.ReadingRepository {
	return &readingRepository{db: db}
}

func (r *readingRepository) UpsertMany(ctx context.Context, readings []model.Reading) error {
	query := `
		INSERT INTO readings (station_id, measured_at, pm25, pm10, o3, co, no2, so2, aqi)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (station_id, measured_at) DO UPDATE SET
			pm25 = EXCLUDED.pm25,
			pm10 = EXCLUDED.pm10,
			o3   = EXCLUDED.o3,
			co   = EXCLUDED.co,
			no2  = EXCLUDED.no2,
			so2  = EXCLUDED.so2,
			aqi  = EXCLUDED.aqi
	`

	return withTx(ctx, r.db, func(tx *sql.Tx) error {
		stmt, err := tx.PrepareContext(ctx, query)
		if err != nil {
			return fmt.Errorf("prepare reading upsert: %w", err)
		}
		defer stmt.Close()

		for _, rd := range readings {
			if _, err := stmt.ExecContext(ctx,
				rd.StationID,
				rd.MeasuredAt,
				helper.NullFloat(rd.PM25),
				helper.NullFloat(rd.PM10),
				helper.NullFloat(rd.O3),
				helper.NullFloat(rd.CO),
				helper.NullFloat(rd.NO2),
				helper.NullFloat(rd.SO2),
				helper.NullInt32(rd.AQI),
			); err != nil {
				return fmt.Errorf("upsert reading of station %q at %s: %w", rd.StationID, rd.MeasuredAt.Format(time.RFC3339), err)
			}
		}
		return nil
	})
}

func (r *readingRepository) GetByStationSince(ctx context.Context, stationID string, since time.Time) ([]model.Reading, error) {
	query := `
		SELECT
			station_id,
			measured_at,
			pm25,
			pm10,
			o3,
			co,
			no2,
			so2,
			aqi
		FROM readings
		WHERE station_id = $1
		  AND measured_at >= $2
		ORDER BY measured_at
	`

	rows, err := r.db.QueryContext(ctx, query, stationID, since)
	if err != nil {
		return nil, fmt.Errorf("query readings of station %q: %w", stationID, err)
	}
	defer rows.Close()

	result := make([]model.Reading, 0)
	for rows.Next() {
		var (
			rd                           model.Reading
			pm25, pm10, o3, co, no2, so2 sql.NullFloat64
			aqi                          sql.NullInt32
		)
		if err := rows.Scan(
			&rd.StationID,
			&rd.MeasuredAt,
			&pm25,
			&pm10,
			&o3,
			&co,
			&no2,
			&so2,
			&aqi,
		); err != nil {
			return nil, fmt.Errorf("scan reading row: %w", err)
		}

		rd.PM25 = helper.FloatPtr(pm25)
		rd.PM10 = helper.FloatPtr(pm10)
		rd.O3 = helper.FloatPtr(o3)
		rd.CO = helper.FloatPtr(co)
		rd.NO2 = helper.FloatPtr(no2)
		rd.SO2 = helper.FloatPtr(so2)
		rd.AQI = helper.IntPtr(aqi)

		result = append(result, rd)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read readings of station %q: %w", stationID, err)
	}

	return result, nil
}

func (r *readingRepository) GetDailyStats(ctx context.Context, stationID string, since time.Time) ([]model.DailyStat, error) {
	query := `
		WITH daily AS (
			SELECT (measured_at AT TIME ZONE 'Asia/Bangkok')::date AS day,
			       AVG(pm25)   AS avg_pm25,
			       MIN(pm25)   AS min_pm25,
			       MAX(pm25)   AS max_pm25,
			       COUNT(pm25) AS samples
			FROM readings
			WHERE station_id = $1
			  AND measured_at >= $2
			  AND pm25 IS NOT NULL
			GROUP BY 1
		)
		SELECT day,
		       avg_pm25::float8,
		       min_pm25::float8,
		       max_pm25::float8,
		       samples::bigint,
		       (AVG(avg_pm25) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW))::float8
		FROM daily
		ORDER BY day
	`

	rows, err := r.db.QueryContext(ctx, query, stationID, since)
	if err != nil {
		return nil, fmt.Errorf("query daily stats of station %q: %w", stationID, err)
	}
	defer rows.Close()

	result := make([]model.DailyStat, 0)
	for rows.Next() {
		var d model.DailyStat
		if err := rows.Scan(
			&d.Day,
			&d.AvgPM25,
			&d.MinPM25,
			&d.MaxPM25,
			&d.Samples,
			&d.Rolling7d,
		); err != nil {
			return nil, fmt.Errorf("scan daily stat row: %w", err)
		}
		result = append(result, d)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read daily stats of station %q: %w", stationID, err)
	}

	return result, nil
}

func (r *readingRepository) GetNationalHourly(ctx context.Context, since time.Time) ([]model.NationalHour, error) {
	query := `
		SELECT date_trunc('hour', measured_at) AS hour,
		       AVG(pm25)::float8               AS avg_pm25,
		       COUNT(*)::bigint                AS stations
		FROM readings
		WHERE measured_at >= $1
		  AND pm25 IS NOT NULL
		GROUP BY 1
		ORDER BY 1
	`

	rows, err := r.db.QueryContext(ctx, query, since)
	if err != nil {
		return nil, fmt.Errorf("query national hourly averages: %w", err)
	}
	defer rows.Close()

	result := make([]model.NationalHour, 0)
	for rows.Next() {
		var h model.NationalHour
		if err := rows.Scan(
			&h.Hour,
			&h.AvgPM25,
			&h.Stations,
		); err != nil {
			return nil, fmt.Errorf("scan national hourly row: %w", err)
		}
		result = append(result, h)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read national hourly averages: %w", err)
	}

	return result, nil
}

func (r *readingRepository) GetNationalDaily(ctx context.Context, since time.Time) ([]model.NationalDay, error) {
	query := `
		WITH station_day AS (
			SELECT station_id,
			       (measured_at AT TIME ZONE 'Asia/Bangkok')::date AS day,
			       AVG(pm25) AS pm25
			FROM readings
			WHERE measured_at >= $1
			  AND pm25 IS NOT NULL
			GROUP BY 1, 2
		)
		SELECT day,
		       MIN(pm25)::float8,
		       AVG(pm25)::float8,
		       MAX(pm25)::float8,
		       COUNT(*)::bigint
		FROM station_day
		GROUP BY day
		ORDER BY day
	`

	rows, err := r.db.QueryContext(ctx, query, since)
	if err != nil {
		return nil, fmt.Errorf("query national daily summary: %w", err)
	}
	defer rows.Close()

	result := make([]model.NationalDay, 0)
	for rows.Next() {
		var d model.NationalDay
		if err := rows.Scan(
			&d.Day,
			&d.MinPM25,
			&d.AvgPM25,
			&d.MaxPM25,
			&d.Stations,
		); err != nil {
			return nil, fmt.Errorf("scan national daily row: %w", err)
		}
		result = append(result, d)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read national daily summary: %w", err)
	}

	return result, nil
}
