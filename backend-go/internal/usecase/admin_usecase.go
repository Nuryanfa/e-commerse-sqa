package usecase

import (
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
)

type adminUsecase struct {
	adminRepo domain.AdminRepository
}

func NewAdminUsecase(adminRepo domain.AdminRepository) domain.AdminUsecase {
	return &adminUsecase{
		adminRepo: adminRepo,
	}
}

func (u *adminUsecase) GetDashboardStats() (domain.AdminDashboardStats, error) {
	grossRev, _ := u.adminRepo.GetGrossRevenue()
	totUsers, _ := u.adminRepo.GetTotalUsers()
	totSellers, _ := u.adminRepo.GetTotalSellers()
	trends, _ := u.adminRepo.GetRevenueTrends()
	topCat, _ := u.adminRepo.GetTopCategories()
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

func (u *adminUsecase) GetUsers() ([]domain.UserWithStats, error) {
	return u.adminRepo.GetUsers()
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

func (u *adminUsecase) AssignCourier(orderID, courierID string) error {
	return u.adminRepo.AssignCourier(orderID, courierID)
}
