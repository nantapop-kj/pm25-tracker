package dto

const (
	StatusOK    = "ok"
	StatusError = "error"
)

// Response คือรูปแบบ JSON ของทุก response
//
//	สำเร็จ: {"status": "ok", "code": 200, "data": ...}
//	ผิดพลาด: {"status": "error", "code": 404, "error": "station \"x\" not found ..."}
type Response struct {
	Status string `json:"status"`
	Code   int    `json:"code"`
	Data   any    `json:"data,omitempty"`
	Error  string `json:"error,omitempty"`
}
