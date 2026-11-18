package helper

import "time"

var Bangkok = loadBangkok()

func loadBangkok() *time.Location {
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return time.FixedZone("ICT", 7*60*60)
	}
	return loc
}

func StartOfDayBangkok(t time.Time) time.Time {
	y, m, d := t.In(Bangkok).Date()
	return time.Date(y, m, d, 0, 0, 0, 0, Bangkok)
}
