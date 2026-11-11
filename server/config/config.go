package config

import (
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName     string
	AppEnv      string
	ServerPort  string
	CORSOrigins []string

	Air4ThaiURL          string
	LocalStationRadiusKm float64
	HTTPTimeout          time.Duration

	ETL      ETLConfig
	Postgres PostgresConfig
}

type ETLConfig struct {
	Schedule   string
	RunOnStart bool
}

type PostgresConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	Schema   string
	SSLMode  string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	return &Config{
		AppName:     GetEnv("APP_NAME", "pm25-tracker"),
		AppEnv:      GetEnv("APP_ENV", ""),
		ServerPort:  GetEnv("SERVER_PORT", "3001"),
		CORSOrigins: GetEnvList("CORS_ORIGINS"),

		Air4ThaiURL:          GetEnv("AIR4THAI_URL", ""),
		LocalStationRadiusKm: GetEnvFloat("LOCAL_STATION_RADIUS_KM", 50),
		HTTPTimeout:          time.Duration(GetEnvInt("HTTP_TIMEOUT_SECONDS", 30)) * time.Second,

		ETL: ETLConfig{
			Schedule:   GetEnv("ETL_SCHEDULE", "15 * * * *"),
			RunOnStart: GetEnvBool("ETL_RUN_ON_START", true),
		},

		Postgres: PostgresConfig{
			Host:     GetEnv("PG_HOST", "localhost"),
			Port:     GetEnv("PG_PORT", "5432"),
			User:     GetEnv("PG_USER", ""),
			Password: GetEnv("PG_PASSWORD", ""),
			Database: GetEnv("PG_DATABASE", ""),
			Schema:   GetEnv("PG_SCHEMA", "public"),
			SSLMode:  GetEnv("PG_SSL_MODE", "disable"),
		},
	}, nil
}
