package domain

import "time"

type Voucher struct {
	ID             string    `json:"id_voucher" gorm:"column:id_voucher;primaryKey"`
	Code           string    `json:"code" gorm:"column:code;unique;not null"`
	DiscountAmount float64   `json:"discount_amount" gorm:"column:discount_amount;not null"` // Potongan harga absolut (mis. Rp15.000)
	MinPurchase    float64   `json:"min_purchase" gorm:"column:min_purchase"`               // Minimal belanja
	ExpiryDate     time.Time `json:"expiry_date" gorm:"column:expiry_date"`
	UsageLimit     int       `json:"usage_limit" gorm:"column:usage_limit"`                 // Batas maksimal kuota klaim secara keseluruhan
	UsedCount      int       `json:"used_count" gorm:"column:used_count;default:0"`         // Jumlah kupon ini pernah dipakai
	IsActive       bool      `json:"is_active" gorm:"column:is_active;default:true"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"column:updated_at"`
}

type VoucherRepository interface {
	FindByCode(code string) (*Voucher, error)
	UpdateUsedCount(tx interface{}, voucherID string) error // tx interface{} agar dapat menerima *gorm.DB dari luar
}
