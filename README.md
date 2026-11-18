# pm25-tracker

A web app for tracking hourly PM2.5 air quality across Thailand, using station data from Air4Thai (Pollution Control Department).

This project is designed to demonstrate:
- A React + Go (Fiber) + PostgreSQL app running fully in Docker
- An ETL job that pulls, cleans, and upserts data from a public API on a schedule
- Layered server code: routes, handlers, services, repositories, wired through interfaces
- SQL for daily stats, 7-day rolling averages, and the nearest station to a point
- A sky-themed UI that follows the time of day in Thailand and the PM2.5 level

---

## ✨ Features

- See the whole country on `/`:
  - The national average PM2.5, its level, and the highest and lowest stations right now.
  - Other pollutants: PM10, O₃, CO, NO₂, and SO₂.
  - Health advice for the current level, and the cleanest 3-hour window of the last 7 days.
  - Daily chart (7, 30, or 90 days) and hourly chart (24, 72, or 168 hours). The hourly chart can switch between pollutants.
  - Top 10 highest and lowest stations.
  - A list of all stations with search, province and level filters, and sorting.
  - A map of all stations.
- Use **Use my location** to switch the page to the nearest station. Switch back with **Thailand**.
- See one station on `/stations/:id`: its rank in Thailand, the change from yesterday, nearby stations, charts, and a map.
- The sky changes with the time in Thailand (morning, afternoon, evening, night), with drifting clouds and twinkling stars at night.
- When PM2.5 is high, the sky turns hazy and dust drifts across the screen.
- Animations stop when the device asks for reduced motion, and glass panels turn solid when it asks for reduced transparency.
- Preview the sky with `?phase=morning|afternoon|evening|night` and `?pm=95`, for example `/?phase=night&pm=95`.

---

## 🧠 Business Rules

1. PM2.5 levels follow the Pollution Control Department, in µg/m³:

   | Level | `very_good` | `good` | `moderate` | `unhealthy` | `very_unhealthy` |
   |---|---|---|---|---|---|
   | PM2.5 | 0–15 | 15.1–25 | 25.1–37.5 | 37.6–75 | > 75 |

   `unknown` means there is no value.
2. The ETL runs on `ETL_SCHEDULE` (default every hour at minute 15, Asia/Bangkok), and once at start when `ETL_RUN_ON_START=true`. A cycle is skipped if the previous one is still running.
3. When cleaning the data:
   - `"-1"`, `"-"`, `"N/A"`, and negative values become `null`.
   - Stations without an ID, duplicate stations, and stations outside Thailand (lat 5–21, lon 97–106) are skipped.
   - Values outside what a sensor can measure become `null`: PM2.5 > 1,000, PM10 > 2,000, O₃ > 500, CO > 50, NO₂ > 1,000, SO₂ > 1,000, AQI > 500.
   - A reading is not saved if its time is more than 1 hour in the future, or if it has no pollutant values at all.
   - Air4Thai times are Thai time and are stored as `TIMESTAMPTZ`.
   - Saving uses `ON CONFLICT`, so running a cycle again never duplicates data.
4. The national overview only counts stations that reported within 3 hours of the newest reading. Others count as `unknown`.
5. The national average is the mean of those stations, rounded to 1 decimal. The rankings show the top 10.
6. The national daily chart takes each station's daily average, then shows the lowest, mean, and highest of those. Days follow Asia/Bangkok.
7. **My location** uses the nearest station that reported PM2.5 in the last 3 hours and is within `LOCAL_STATION_RADIUS_KM` (default 50 km). Otherwise the API returns 404 and the page shows all of Thailand.
8. The browser rounds coordinates to 2 decimals (about 1 km) before sending them. The server rounds them again and does not save or log them.
9. The cleanest 3-hour window needs at least 72 readings that cover all 24 hours of the day.

---

## ⚙️ Configuration

Copy the example file, then edit `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `APP_NAME` | Project name |
| `APP_ENV` | Environment name, such as `dev` |
| `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE` | PostgreSQL connection. Inside Docker, `docker-compose.yml` sets the host to `db`. |
| `PG_SCHEMA` | Schema for the tables (default `public`) |
| `PG_SSL_MODE` | `disable` for local use, `require` for a hosted database |
| `AIR4THAI_URL` | Air4Thai data URL, for example `http://air4thai.pcd.go.th/services/getNewAQI_JSON.php` |
| `LOCAL_STATION_RADIUS_KM` | Largest distance for **My location** (default `50`) |
| `ETL_SCHEDULE` | Cron schedule for the ETL (default `15 * * * *`) |
| `ETL_RUN_ON_START` | Run one ETL cycle when it starts (default `true`) |
| `HTTP_TIMEOUT_SECONDS` | Timeout for calls to Air4Thai (default `30`) |
| `CLIENT_PORT` | Web port (default `3000`) |
| `VITE_API_URL` | API address that the web app forwards `/api` requests to. Inside Docker, `docker-compose.yml` sets it to `http://server:3001`. |
| `SERVER_PORT` | API port (default `3001`) |
| `CORS_ORIGINS` | Allowed origins, separated by `,` |

---

## 🚀 How to Run

### 1. Start the containers
```bash
docker compose up -d --build
```

The `server` and `client` containers stay idle until you start the apps.

### 2. Create the tables
```bash
docker exec -i pm25-tracker-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < server/internal/db/schema.sql
```

The file can be run again; tables that already exist are skipped.

### 3. Load the first data
```bash
docker exec -it pm25-tracker-server go run ./cmd/etl -once
```

To keep the ETL running on its schedule:
```bash
docker compose --profile etl up -d etl
docker compose logs -f etl
```

### 4. Start the API and the web app
```bash
docker exec -it pm25-tracker-server go run ./cmd/api
```
```bash
docker exec -it pm25-tracker-client npm start
```

- Web: http://localhost:3000
- API: http://localhost:3001/health

### Development notes
- Code changes in `client/` reload automatically, because `client/` and `server/` are mounted into the containers. Restart `go run` after changing Go code.
- After pulling changes that add npm packages, recreate the client's `node_modules`. It is a separate volume from your machine.
  ```bash
  docker compose up -d --build --renew-anon-volumes --no-deps client
  ```
- `PG_USER`, `PG_PASSWORD`, and `PG_DATABASE` are only used to set up the database the first time its volume is created. If you change them in `.env` later, change them in PostgreSQL too, or remove the volume with `docker compose down -v`.
- Check the code:
  ```bash
  docker exec pm25-tracker-server go vet ./...
  docker exec pm25-tracker-client npx tsc -b
  ```
- Run `git` from the project folder on your machine, not inside a container.

---

## 🔌 API

All paths except `/health` start with `/api/v1`. All endpoints are `GET`.

Responses use the shape `{ "status": "ok", "code": 200, "data": ... }`, and errors use `{ "status": "error", "code": 404, "error": "..." }`.

| Path | Query | Description |
|---|---|---|
| `/health` | | Health check |
| `/stations` | | All stations with their latest reading |
| `/stations/:id` | | One station |
| `/stations/:id/readings` | `hours` (1–744, default 72) | Hourly readings |
| `/stations/:id/daily` | `days` (1–365, default 30) | Daily mean, min, and max, plus the 7-day rolling average |
| `/analytics/overview` | | National average, station count per level, top 10 highest and lowest |
| `/analytics/hourly` | `hours` (1–168, default 12) | National average PM2.5 per hour |
| `/analytics/daily` | `days` (1–90, default 7) | Lowest, mean, and highest station average per day |
| `/local` | `lat`, `lon` (required) | Nearest station with its last 12 hours and 7 days. 404 when no station is in range. |

---

## 📊 Example Output

ETL console:

```
2026/11/18 07:44:18 postgres connected: db:5432/pm25_tracker_db
2026/11/18 07:44:18 etl scheduled: "15 * * * *" (Asia/Bangkok)
2026/11/18 07:44:18 etl: air4thai ingested fetched=178 saved=178 skipped=0 duration=311.216916ms
```

`GET /api/v1/stations/35t/daily?days=7`:

```json
{
  "status": "ok",
  "code": 200,
  "data": [
    { "day": "2026-11-09", "avgPm25": 25, "minPm25": 20.1, "maxPm25": 30.3,
      "samples": 24, "rolling7d": 37.2, "level": "moderate" }
  ]
}
```

---

## 🌏 Data Sources

- **Air quality:** [Air4Thai](http://air4thai.pcd.go.th), Pollution Control Department, Thailand
- **Map tiles:** © OpenStreetMap contributors, © CARTO
- **PM2.5 levels:** the Thai standard from the Pollution Control Department

---

## 📁 Project Structure

```
pm25-tracker/
├── client/                      # React + Vite
│   ├── src/
│   │   ├── page/                # Dashboard, station detail, 404
│   │   ├── components/          # Page building blocks: sky, cards, charts, map, lists
│   │   ├── hooks/               # TanStack Query hooks
│   │   ├── services/            # API calls (the only place that knows the URLs)
│   │   ├── contexts/            # Filters, sky, my location
│   │   ├── lib/                 # Levels, formatting, health advice, distance
│   │   ├── enums/
│   │   ├── routes/              # Paths
│   │   └── types/
│   ├── vite.config.ts           # /api proxy to the server
│   └── Dockerfile
├── server/                      # Go + Fiber
│   ├── cmd/
│   │   ├── api/                 # Start the HTTP server
│   │   └── etl/                 # Run the ETL on a schedule, or once with -once
│   ├── config/                  # Env
│   ├── internal/
│   │   ├── bootstrap/           # Wire repositories, services, and handlers
│   │   ├── db/                  # Connection and schema.sql
│   │   ├── routes/              # Paths
│   │   ├── handler/             # Read the request, call a service, send the response
│   │   ├── service/             # Business logic and data cleaning
│   │   ├── repository/          # Database queries and the Air4Thai source
│   │   ├── interfaces/          # Contracts between layers
│   │   ├── model/               # Entities
│   │   ├── dto/                 # Response shapes
│   │   ├── middleware/          # CORS, error handler
│   │   ├── httpclient/          # HTTP client with the extra certificates
│   │   ├── helper/              # Query params, levels, numbers, time, validation
│   │   └── enums/
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🤖 AI Assistance

AI was used to help with:

- **UX/UI design:** the page layouts, the sky theme, the cards, charts, and map, and the animations: drifting clouds, twinkling stars, floating dust, and the sky changing with the time of day
- **Calculation logic:** the rules in [🧠 Business Rules](#-business-rules), such as the PM2.5 levels, the national averages, the cleanest 3-hour window, and the distance to the nearest station
- **Research:** finding information such as the Air4Thai data, the Thai PM2.5 standard, and why Air4Thai's certificate failed to verify
- **Code review:** checking and reviewing the code
- **Debugging:** finding and fixing bugs

All code written with AI help was reviewed again before it was used.

---

## 📄 License
MIT License. See [LICENSE](LICENSE).

Air quality data belongs to the Pollution Control Department, Thailand.
