package helper

import "math"

func Mean(xs []float64) float64 {
	if len(xs) == 0 {
		return 0
	}

	var sum float64
	for _, x := range xs {
		sum += x
	}

	return sum / float64(len(xs))
}

func Round(x float64, places int) float64 {
	p := math.Pow(10, float64(places))
	return math.Round(x*p) / p
}

func RoundPtr(v *float64, places int) *float64 {
	if v == nil {
		return nil
	}

	return Ptr(Round(*v, places))
}

func Ptr[T any](v T) *T {
	return &v
}
