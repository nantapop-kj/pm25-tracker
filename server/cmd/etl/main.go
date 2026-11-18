package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
	_ "time/tzdata"

	"github.com/robfig/cron/v3"

	"github.com/nantapop-kj/pm25-tracker/server/internal/bootstrap"
	"github.com/nantapop-kj/pm25-tracker/server/internal/helper"
	"github.com/nantapop-kj/pm25-tracker/server/internal/interfaces"
)

func main() {
	once := flag.Bool("once", false, "run a single ingest cycle and exit")
	flag.Parse()

	if err := run(*once); err != nil {
		log.Fatal(err)
	}
}

func run(once bool) error {
	deps, err := bootstrap.InitDependencies()
	if err != nil {
		return err
	}
	defer deps.Close()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	ingest := deps.Services.Ingest
	if once {
		runCycle(ctx, ingest)
		return nil
	}

	var mu sync.Mutex
	job := func() {
		if !mu.TryLock() {
			log.Print("etl: previous cycle still running, skipping")
			return
		}
		defer mu.Unlock()
		runCycle(ctx, ingest)
	}

	c := cron.New(cron.WithLocation(helper.Bangkok))
	if _, err := c.AddFunc(deps.Config.Etl.Schedule, job); err != nil {
		return err
	}
	c.Start()
	log.Printf("etl scheduled: %q (Asia/Bangkok)", deps.Config.Etl.Schedule)

	if deps.Config.Etl.RunOnStart {
		go job()
	}

	<-ctx.Done()
	log.Print("etl: shutting down")
	<-c.Stop().Done()

	return nil
}

func runCycle(ctx context.Context, ingest interfaces.IngestService) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	res, err := ingest.IngestAirQuality(ctx)
	if err != nil {
		log.Printf("etl: %s ingest failed: %v", res.Source, err)
		return
	}

	log.Printf("etl: %s ingested fetched=%d saved=%d skipped=%d duration=%s",
		res.Source, res.Fetched, res.Saved, res.Skipped, res.Duration)
}
