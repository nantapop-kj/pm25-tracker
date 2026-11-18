package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

func GetEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func GetEnvInt(key string, fallback int) int {
	v := GetEnv(key, "")
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		log.Printf("config: invalid int for %s=%q, using default %d", key, v, fallback)
		return fallback
	}
	return n
}

func GetEnvFloat(key string, fallback float64) float64 {
	v := GetEnv(key, "")
	if v == "" {
		return fallback
	}
	f, err := strconv.ParseFloat(v, 64)
	if err != nil {
		log.Printf("config: invalid float for %s=%q, using default %v", key, v, fallback)
		return fallback
	}
	return f
}

func GetEnvBool(key string, fallback bool) bool {
	v := GetEnv(key, "")
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		log.Printf("config: invalid bool for %s=%q, using default %t", key, v, fallback)
		return fallback
	}
	return b
}

func GetEnvList(key string) []string {
	var out []string
	for s := range strings.SplitSeq(GetEnv(key, ""), ",") {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}
