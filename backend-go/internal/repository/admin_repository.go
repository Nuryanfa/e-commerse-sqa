package repository

import (
	"fmt"
	"time"

	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) domain.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) GetGrossRevenue(days int) (float64, error) {
	var total float64
	err := r.db.Model(&domain.Order{}).
		Where("status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
		Where("created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Select("COALESCE(SUM(total_amount), 0)").Scan(&total).Error
	return total, err
}

func (r *adminRepository) GetTotalUsers() (int, error) {
	var count int64
	err := r.db.Model(&domain.User{}).Where("role = ?", "pembeli").Count(&count).Error
	return int(count), err
}

func (r *adminRepository) GetTotalSellers() (int, error) {
	var count int64
	err := r.db.Model(&domain.User{}).Where("role = ?", "supplier").Count(&count).Error
	return int(count), err
}

func (r *adminRepository) GetRevenueTrends(days int) ([]domain.RevenueData, error) {
	var trends []domain.RevenueData
	err := r.db.Model(&domain.Order{}).
		Select("DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as revenue").
		Where("status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
		Where("created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&trends).Error
	return trends, err
}

func (r *adminRepository) GetTopCategories(days int) ([]domain.CategoryMetric, error) {
	var categories []domain.CategoryMetric
	
	// First get total quantity sold in the period
	var totalQuantity float64
	r.db.Table("order_items").
		Joins("JOIN orders ON orders.id_order = order_items.id_order").
		Where("orders.status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
		Where("orders.created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Select("COALESCE(SUM(order_items.quantity), 1)").Scan(&totalQuantity)
		
	if totalQuantity == 0 {
		totalQuantity = 1 // avoid division by zero
	}

	err := r.db.Table("order_items").
		Select("categories.name, ROUND((SUM(order_items.quantity) * 100.0) / ?, 1) as percentage", totalQuantity).
		Joins("JOIN products ON products.id_product = order_items.id_product").
		Joins("JOIN categories ON categories.id_category = products.id_category").
		Joins("JOIN orders ON orders.id_order = order_items.id_order").
		Where("orders.status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
		Where("orders.created_at >= ?", time.Now().AddDate(0, 0, -days)).
		Group("categories.name").
		Order("percentage DESC").
		Limit(5).
		Scan(&categories).Error

	return categories, err
}

func (r *adminRepository) GetRecentLogs() ([]domain.SystemLog, error) {
	// Return mock logs for now, or if an audit_logs table exists, query it.
	return []domain.SystemLog{
		{Event: "System Boot", UserIP: "127.0.0.1", Status: "SUCCESS", Time: time.Now()},
		{Event: "Admin Login", UserIP: "192.168.1.10", Status: "SUCCESS", Time: time.Now()},
		{Event: "Failed Payment", UserIP: "10.0.0.5", Status: "ERROR", Time: time.Now()},
	}, nil
}

func (r *adminRepository) GetRecentLiveFeed() ([]domain.LiveFeedItem, error) {
	var feed []domain.LiveFeedItem
	var orders []domain.Order
	err := r.db.Order("created_at DESC").Limit(5).Find(&orders).Error
	if err == nil {
		for _, o := range orders {
			feed = append(feed, domain.LiveFeedItem{
				Title:       "New Order",
				Description: "Order " + o.ID + " created with status " + o.Status,
				Time:        o.CreatedAt,
			})
		}
	}
	var newUsers []domain.User
	err2 := r.db.Order("created_at DESC").Limit(3).Find(&newUsers).Error
	if err2 == nil {
		for _, u := range newUsers {
			feed = append(feed, domain.LiveFeedItem{
				Title:       "New User Registration",
				Description: u.Nama + " registered as " + u.Role,
				Time:        u.CreatedAt,
			})
		}
	}
	return feed, nil
}

func (r *adminRepository) GetUsers() ([]domain.UserWithStats, error) {
	var users []domain.User
	// Use Unscoped to include soft-deleted (suspended) users
	err := r.db.Unscoped().Order("created_at DESC").Find(&users).Error
	if err != nil {
		return nil, err
	}

	var result []domain.UserWithStats
	for _, u := range users {
		status := "Active"
		if u.DeletedAt.Valid {
			status = "Suspended"
		}
		
		result = append(result, domain.UserWithStats{
			ID:        u.ID,
			Name:      u.Nama,
			Email:     u.Email,
			Role:      u.Role,
			Status:    status,
			Location:  u.Address,
			CreatedAt: u.CreatedAt,
		})
	}
	return result, nil
}

func (r *adminRepository) UpdateUserStatus(id, status string) error {
	if status == "Suspended" {
		// Soft delete means suspended
		return r.db.Where("id_user = ?", id).Delete(&domain.User{}).Error
	} else {
		// Activate means restoring the soft delete
		return r.db.Unscoped().Model(&domain.User{}).Where("id_user = ?", id).Update("deleted_at", nil).Error
	}
}

func (r *adminRepository) DeleteUser(id string) error {
	// Unscoped Delete means hard delete (permanent)
	return r.db.Unscoped().Where("id_user = ?", id).Delete(&domain.User{}).Error
}

func (r *adminRepository) GetSellers() ([]domain.SellerWithStats, error) {
	var sellers []domain.User
	err := r.db.Where("role = ?", "supplier").Order("created_at DESC").Find(&sellers).Error
	if err != nil {
		return nil, err
	}

	if len(sellers) == 0 {
		return []domain.SellerWithStats{}, nil
	}

	sellerIDs := make([]string, len(sellers))
	for i, s := range sellers {
		sellerIDs[i] = s.ID
	}

	// [SQA FIX]: Batch count products using GROUP BY to solve N+1 Query Problem
	type sellerProductCount struct {
		SupplierID string
		Total      int
	}
	var counts []sellerProductCount
	r.db.Model(&domain.Product{}).
		Select("supplier_id, count(*) as total").
		Where("supplier_id IN ?", sellerIDs).
		Group("supplier_id").
		Scan(&counts)

	countMap := make(map[string]int)
	for _, c := range counts {
		countMap[c.SupplierID] = c.Total
	}

	var result []domain.SellerWithStats
	for _, s := range sellers {
		result = append(result, domain.SellerWithStats{
			ID:        s.ID,
			StoreName: s.Nama, // Mock StoreName
			OwnerName: s.Nama,
			Status:    "Verified", // Mock Status
			Products:  countMap[s.ID],
			Rating:    4.8, // Mock average rating
			Category:  "Fresh Produce",
			CreatedAt: s.CreatedAt,
		})
	}
	return result, nil
}

func (r *adminRepository) GetPaidOrders() ([]domain.OrderSummary, error) {
	type row struct {
		ID          string
		BuyerName   string
		TotalAmount float64
		Status      string
		CourierID   *string
		CourierName *string
		CreatedAt   time.Time
	}
	var rows []row
	err := r.db.Table("orders").
		Select(`orders.id_order AS id, users.nama AS buyer_name,
			orders.total_amount, orders.status, orders.courier_id,
			couriers.nama AS courier_name, orders.created_at`).
		Joins("LEFT JOIN users ON users.id_user = orders.id_user").
		Joins("LEFT JOIN users couriers ON couriers.id_user = orders.courier_id").
		Where("orders.status IN ?", []string{"PAID", "PROCESSED", "SHIPPED"}).
		Where("orders.deleted_at IS NULL").
		Order("orders.created_at DESC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	result := make([]domain.OrderSummary, 0, len(rows))
	for _, row := range rows {
		result = append(result, domain.OrderSummary{
			ID:          row.ID,
			BuyerName:   row.BuyerName,
			TotalAmount: row.TotalAmount,
			Status:      row.Status,
			CourierID:   row.CourierID,
			CourierName: row.CourierName,
			CreatedAt:   row.CreatedAt,
		})
	}
	return result, nil
}

func (r *adminRepository) AssignCourier(orderID, courierID string) error {
	// Verify courier exists and has courier role
	var courier domain.User
	if err := r.db.Where("id_user = ? AND role = ?", courierID, "courier").First(&courier).Error; err != nil {
		return fmt.Errorf("kurir tidak ditemukan atau bukan role courier")
	}

	// Admin hanya menjadi dispatcher setelah supplier selesai menyiapkan pesanan.
	// Status tetap PROCESSED sampai kurir menerima tugas dan mulai mengirim.
	result := r.db.Model(&domain.Order{}).
		Where("id_order = ? AND status = ? AND courier_id IS NULL", orderID, "PROCESSED").
		Updates(map[string]interface{}{
			"courier_id": courierID,
			"updated_at": time.Now(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected != 1 {
		return fmt.Errorf("pesanan harus berstatus PROCESSED dan belum memiliki kurir")
	}
	return nil
}
