package repository

import (
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

func (r *adminRepository) GetGrossRevenue() (float64, error) {
	var total float64
	// Sum total_amount of orders where status is 'DELIVERED', 'COMPLETED', or 'PAID' (or whatever counts as revenue)
	err := r.db.Model(&domain.Order{}).
		Where("status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
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

func (r *adminRepository) GetRevenueTrends() ([]domain.RevenueData, error) {
	// Group sum of total_amount by date for the last 7 days
	var trends []domain.RevenueData
	err := r.db.Model(&domain.Order{}).
		Select("DATE(created_at) as date, SUM(total_amount) as revenue").
		Where("status IN ?", []string{"PAID", "PROCESSED", "SHIPPED", "DELIVERED"}).
		Where("created_at >= ?", time.Now().AddDate(0, 0, -7)).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&trends).Error
	return trends, err
}

func (r *adminRepository) GetTopCategories() ([]domain.CategoryMetric, error) {
	// A simple mock since calculating exactly without complex joins might be tricky, or we can do a JOIN:
	var categories []domain.CategoryMetric
	err := r.db.Table("order_items").
		Select("categories.name, SUM(order_items.quantity) as percentage").
		Joins("JOIN products ON products.id_product = order_items.id_product").
		Joins("JOIN categories ON categories.id_category = products.id_category").
		Group("categories.name").
		Order("percentage DESC").
		Limit(5).
		Scan(&categories).Error

	// Convert "percentage" from raw sum to actual percentage if needed (in usecase), here we just return the raw quantity sum.
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
	err := r.db.Order("created_at DESC").Find(&users).Error
	if err != nil {
		return nil, err
	}

	var result []domain.UserWithStats
	for _, u := range users {
		result = append(result, domain.UserWithStats{
			ID:        u.ID,
			Name:      u.Nama,
			Email:     u.Email,
			Role:      u.Role,
			Status:    "Active", // Standard dummy status for active users
			Location:  u.Address,
			CreatedAt: u.CreatedAt,
		})
	}
	return result, nil
}

func (r *adminRepository) GetSellers() ([]domain.SellerWithStats, error) {
	var sellers []domain.User
	err := r.db.Where("role = ?", "supplier").Order("created_at DESC").Find(&sellers).Error
	if err != nil {
		return nil, err
	}

	var result []domain.SellerWithStats
	for _, s := range sellers {
		// Hitung jumlah produk untuk setiap seller
		var productCount int64
		r.db.Model(&domain.Product{}).Where("supplier_id = ?", s.ID).Count(&productCount)

		result = append(result, domain.SellerWithStats{
			ID:        s.ID,
			StoreName: s.Nama,
			OwnerName: s.Nama,
			Status:    "Verified", // Default mock
			Products:  int(productCount),
			Rating:    4.8, // Mock average rating
			Category:  "Fresh Produce",
			CreatedAt: s.CreatedAt,
		})
	}
	return result, nil
}
