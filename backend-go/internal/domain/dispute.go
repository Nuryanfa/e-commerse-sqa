package domain

import "time"

// Dispute merepresentasikan tiket sengketa/komplain pengguna
type Dispute struct {
	ID        string    `json:"id_dispute" gorm:"column:id_dispute;primaryKey"`
	OrderID   string    `json:"id_order" gorm:"column:id_order;uniqueIndex"`
	Order     *Order    `json:"order,omitempty" gorm:"foreignKey:OrderID;references:ID"`
	BuyerID   string    `json:"id_buyer" gorm:"column:id_buyer"`
	Buyer     *User     `json:"buyer,omitempty" gorm:"foreignKey:BuyerID;references:ID"`
	CourierID *string   `json:"courier_id" gorm:"column:courier_id;index"`
	Courier   *User     `json:"courier,omitempty" gorm:"foreignKey:CourierID;references:ID"`
	Reason    string    `json:"reason" gorm:"column:reason" binding:"required"`
	Status    string    `json:"status" gorm:"column:status;index"` // OPEN, APPROVED_FOR_RETURN, RETURNING, RETURNED, REFUNDED, REJECTED
	ImageURL  string    `json:"image_url,omitempty" gorm:"column:image_url"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
	AdminNote string    `json:"admin_note,omitempty" gorm:"column:admin_note"`
}

// DisputeMessage merepresentasikan mini-chat room di dalam tiket Sengketa tersebut
type DisputeMessage struct {
	ID        string    `json:"id_message" gorm:"column:id_message;primaryKey"`
	DisputeID string    `json:"id_dispute" gorm:"column:id_dispute"`
	Dispute   *Dispute  `json:"dispute,omitempty" gorm:"foreignKey:DisputeID;references:ID;constraint:OnDelete:CASCADE;"` // Jika tiket dihapus, pesan otomatis hilang
	SenderID  string    `json:"sender_id" gorm:"column:sender_id"`                                                        // Bisa jadi Buyer, Supplier, atau Admin
	Sender    *User     `json:"sender,omitempty" gorm:"foreignKey:SenderID;references:ID"`
	Message   string    `json:"message" gorm:"column:message" binding:"required"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
}
