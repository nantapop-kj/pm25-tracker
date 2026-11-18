package helper

import "database/sql"

func NullFloat(value *float64) sql.NullFloat64 {
	if value == nil {
		return sql.NullFloat64{}
	}

	return sql.NullFloat64{Float64: *value, Valid: true}
}

func FloatPtr(value sql.NullFloat64) *float64 {
	if !value.Valid {
		return nil
	}

	return Ptr(value.Float64)
}

func NullInt32(value *int) sql.NullInt32 {
	if value == nil {
		return sql.NullInt32{}
	}

	return sql.NullInt32{Int32: int32(*value), Valid: true}
}

func IntPtr(value sql.NullInt32) *int {
	if !value.Valid {
		return nil
	}

	return Ptr(int(value.Int32))
}
