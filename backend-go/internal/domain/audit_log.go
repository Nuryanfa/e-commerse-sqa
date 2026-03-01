package domain

import "time"

type AuditLog struct {
	ID        string    `json:"id_audit_log" gorm:"column:id_audit_log;primaryKey"`
	UserID    string    `json:"id_user" gorm:"column:id_user"` // Siapa pelakunya (Admin/Supplier)
	Action    string    `json:"action" gorm:"column:action"`   // Misalnya: UPDATE_PRICE, UPDATE_STOCK, PROCESS_ORDER
	Entity    string    `json:"entity" gorm:"column:entity"`   // Tabel yang berubah (products, orders)
	EntityID  string    `json:"entity_id" gorm:"column:entity_id"`
	OldValues string    `json:"old_values" gorm:"column:old_values;type:json"` // Bebas format JSON Text
	NewValues string    `json:"new_values" gorm:"column:new_values;type:json"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
}

type AuditLogRepository interface {
	Insert(log *AuditLog) error
	FindByEntity(entity string, entityID string) ([]AuditLog, error)
}
