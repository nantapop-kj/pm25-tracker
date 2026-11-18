CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(20) PRIMARY KEY,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    area_th VARCHAR(255) NOT NULL DEFAULT '',
    area_en VARCHAR(255) NOT NULL DEFAULT '',
    station_type VARCHAR(50) NOT NULL DEFAULT '',
    lat DOUBLE PRECISION NOT NULL CHECK (
        lat BETWEEN -90
        AND 90
    ),
    lon DOUBLE PRECISION NOT NULL CHECK (
        lon BETWEEN -180
        AND 180
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readings (
    station_id VARCHAR(20) NOT NULL REFERENCES stations (id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    pm25 DOUBLE PRECISION CHECK (pm25 >= 0),
    pm10 DOUBLE PRECISION CHECK (pm10 >= 0),
    o3 DOUBLE PRECISION CHECK (o3 >= 0),
    co DOUBLE PRECISION CHECK (co >= 0),
    no2 DOUBLE PRECISION CHECK (no2 >= 0),
    so2 DOUBLE PRECISION CHECK (so2 >= 0),
    aqi INTEGER CHECK (aqi >= 0),
    PRIMARY KEY (station_id, measured_at)
);

CREATE INDEX IF NOT EXISTS readings_measured_at_idx ON readings (measured_at);