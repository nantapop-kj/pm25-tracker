package helper

import "github.com/nantapop-kj/pm25-tracker/server/internal/enums"

func PM25ToLevel(v *float64) enums.PM25Level {
	if v == nil {
		return enums.LevelUnknown
	}

	switch x := *v; {
	case x <= 15:
		return enums.LevelVeryGood
	case x <= 25:
		return enums.LevelGood
	case x <= 37.5:
		return enums.LevelModerate
	case x <= 75:
		return enums.LevelUnhealthy
	default:
		return enums.LevelVeryUnhealthy
	}
}
