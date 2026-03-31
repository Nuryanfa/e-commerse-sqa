package domain

import "time"

// AdminDashboardStats represents the high-level metrics for the Admin Dashboard
type AdminDashboardStats struct {
	GrossRevenue        float64          `json:"gross_revenue"`
	TotalUsers          int              `json:"total_users"`
	TotalSellers        int              `json:"total_sellers"`
	RevenueTrends       []RevenueData    `json:"revenue_trends"`
	TopCategories       []CategoryMetric `json:"top_categories"`
	RecentLogs          []SystemLog      `json:"recent_logs"`
	RecentLiveFeed      []LiveFeedItem   `json:"live_feed"`
}

type RevenueData struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
}

type CategoryMetric struct {
	Name       string  `json:"name"`
	Percentage float64 `json:"percentage"`
}

type SystemLog struct {
	Event  string    `json:"event"`
	UserIP string    `json:"user_ip"`
	Status string    `json:"status"`
	Time   time.Time `json:"time"`
}

type LiveFeedItem struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Time        time.Time `json:"time"`
}

// UserWithStats represents a user row in the Admin Users table
type UserWithStats struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`
}

// SellerWithStats represents a seller row in the Admin Sellers table
type SellerWithStats struct {
	ID        string    `json:"id"`
	StoreName string    `json:"store_name"`
	OwnerName string    `json:"owner_name"`
	Status    string    `json:"status"`
	Products  int       `json:"products"`
	Rating    float64   `json:"rating"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"created_at"`
}

// AdminUsecase Interface
type AdminUsecase interface {
	GetDashboardStats() (AdminDashboardStats, error)
	GetUsers() ([]UserWithStats, error)
	GetSellers() ([]SellerWithStats, error)
	GetSystemLogs() ([]SystemLog, error)
}

// AdminRepository Interface
type AdminRepository interface {
	GetGrossRevenue() (float64, error)
	GetTotalUsers() (int, error)
	GetTotalSellers() (int, error)
	GetRevenueTrends() ([]RevenueData, error)
	GetTopCategories() ([]CategoryMetric, error)
	GetRecentLogs() ([]SystemLog, error)
	GetRecentLiveFeed() ([]LiveFeedItem, error)
	GetUsers() ([]UserWithStats, error)
	GetSellers() ([]SellerWithStats, error)
}
