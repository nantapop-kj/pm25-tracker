package enums

type PM25Level string

const (
	LevelVeryGood      PM25Level = "very_good"
	LevelGood          PM25Level = "good"
	LevelModerate      PM25Level = "moderate"
	LevelUnhealthy     PM25Level = "unhealthy"
	LevelVeryUnhealthy PM25Level = "very_unhealthy"
	LevelUnknown       PM25Level = "unknown"
)

var AllPM25Levels = []PM25Level{
	LevelVeryGood,
	LevelGood,
	LevelModerate,
	LevelUnhealthy,
	LevelVeryUnhealthy,
	LevelUnknown,
}
