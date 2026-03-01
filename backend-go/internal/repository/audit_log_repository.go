package repository

import (
	"github.com/nuryanfa/e-commerse-sqa/internal/domain"
	"gorm.io/gorm"
)

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) domain.AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Insert(log *domain.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *auditLogRepository) FindByEntity(entity string, entityID string) ([]domain.AuditLog, error) {
	var logs []domain.AuditLog
	err := r.db.Where("entity = ? AND entity_id = ?", entity, entityID).Order("created_at desc").Find(&logs).Error
	return logs, err
}
