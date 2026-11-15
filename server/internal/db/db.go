package db

import (
	"context"
	"database/sql"
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/nantapop-kj/pm25-tracker/server/config"
)

func Connect(cfg config.PostgresConfig) (*sql.DB, error) {
	if err := validate(cfg); err != nil {
		return nil, err
	}

	db, err := sql.Open("pgx", dsn(cfg))
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("connect postgres: %w", err)
	}

	return db, nil
}

func dsn(cfg config.PostgresConfig) string {
	u := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(cfg.User, cfg.Password),
		Host:   net.JoinHostPort(cfg.Host, cfg.Port),
		Path:   cfg.Database,
		RawQuery: url.Values{
			"sslmode":     {cfg.SSLMode},
			"search_path": {cfg.Schema},
		}.Encode(),
	}

	return u.String()
}

func validate(cfg config.PostgresConfig) error {
	var missing []string
	for _, env := range []struct{ name, value string }{
		{"PG_USER", cfg.User},
		{"PG_PASSWORD", cfg.Password},
		{"PG_DATABASE", cfg.Database},
	} {
		if env.value == "" {
			missing = append(missing, env.name)
		}
	}

	if len(missing) > 0 {
		return fmt.Errorf("missing env: %s (is .env loaded? run the app with docker compose)", strings.Join(missing, ", "))
	}

	return nil
}
