package usecase

import (
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type adminUsecase struct {
	adminRepo domain.AdminRepository
}

// AssignCourier implements domain.AdminUsecase.
func (u *adminUsecase) AssignCourier(orderID string, courierID string) error {
	panic("unimplemented")
}

func NewAdminUsecase(adminRepo domain.AdminRepository) domain.AdminUsecase {
	return &adminUsecase{
		adminRepo: adminRepo,
	}
}

func (u *adminUsecase) GetDashboardStats(days int) (domain.AdminDashboardStats, error) {
	if days <= 0 {
		days = 7 // Default 7 days
	}
	grossRev, _ := u.adminRepo.GetGrossRevenue(days)
	totUsers, _ := u.adminRepo.GetTotalUsers()
	totSellers, _ := u.adminRepo.GetTotalSellers()
	trends, _ := u.adminRepo.GetRevenueTrends(days)
	topCat, _ := u.adminRepo.GetTopCategories(days)
	logs, _ := u.adminRepo.GetRecentLogs()
	feed, _ := u.adminRepo.GetRecentLiveFeed()

	return domain.AdminDashboardStats{
		GrossRevenue:   grossRev,
		TotalUsers:     totUsers,
		TotalSellers:   totSellers,
		RevenueTrends:  trends,
		TopCategories:  topCat,
		RecentLogs:     logs,
		RecentLiveFeed: feed,
	}, nil
}

func (u *adminUsecase) GetRevenueDetails(days int) (map[string]interface{}, error) {
	if days <= 0 {
		days = 30
	}
	grossRev, _ := u.adminRepo.GetGrossRevenue(days)
	trends, _ := u.adminRepo.GetRevenueTrends(days)
	orders, _ := u.adminRepo.GetPaidOrders()

	// 5% Platform Fee
	platformFee := grossRev * 0.05
	supplierRevenue := grossRev - platformFee

	return map[string]interface{}{
		"gross_revenue":       grossRev,
		"platform_fee":        platformFee,
		"supplier_revenue":    supplierRevenue,
		"revenue_trends":      trends,
		"recent_transactions": orders,
	}, nil
}

func (u *adminUsecase) GetUsers() ([]domain.UserWithStats, error) {
	return u.adminRepo.GetUsers()
}

func (u *adminUsecase) UpdateUserStatus(id, status string) error {
	return u.adminRepo.UpdateUserStatus(id, status)
}

func (u *adminUsecase) DeleteUser(id string) error {
	return u.adminRepo.DeleteUser(id)
}

func (u *adminUsecase) GetSellers() ([]domain.SellerWithStats, error) {
	return u.adminRepo.GetSellers()
}

func (u *adminUsecase) GetSystemLogs() ([]domain.SystemLog, error) {
	return u.adminRepo.GetRecentLogs()
}

func (u *adminUsecase) GetPaidOrders() ([]domain.OrderSummary, error) {
	return u.adminRepo.GetPaidOrders()
}
