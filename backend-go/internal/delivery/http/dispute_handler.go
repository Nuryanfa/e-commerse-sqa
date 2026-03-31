package http

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
	"github.com/nuryanfa/e-commerse-sqa/pkg/response"
)

type DisputeHandler struct {
	disputeUC usecase.DisputeUseCase
}

func NewDisputeHandler(uc usecase.DisputeUseCase) *DisputeHandler {
	return &DisputeHandler{disputeUC: uc}
}

// POST /api/disputes/:id
func (h *DisputeHandler) OpenDispute(c *gin.Context) {
	orderID := c.Param("id") // Extract 'id' which serves as order_id here
	uidVal, exists := c.Get("user_id") // SQA: was hardcoded "userID" but middleware sets "user_id"
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, ok := uidVal.(string)
	if !ok {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}

	// Ambil input form-data karena mungkin ada gambar
	reason := c.PostForm("reason")
	if reason == "" {
		response.Error(c, response.ErrBadRequest("Alasan pengajuan komplain harus diisi"))
		return
	}

	imageURL := ""
	file, _ := c.FormFile("image")
	if file != nil {
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		uploadPath := filepath.Join("uploads", filename)
		if err := c.SaveUploadedFile(file, uploadPath); err != nil {
			response.Error(c, response.ErrInternal("Gagal mengunggah gambar bukti"))
			return
		}
		imageURL = "/uploads/" + filename
	}

	dispute, err := h.disputeUC.OpenDispute(orderID, uid, reason, imageURL)
	if err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Komplain sengketa berhasil diajukan, menunggu respons penjual.", dispute)
}

// GET /api/disputes
func (h *DisputeHandler) GetMyDisputes(c *gin.Context) {
	uidVal, exists := c.Get("user_id") 
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, _ := uidVal.(string)

	roleVal, exists := c.Get("role")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Role tidak valid"))
		return
	}
	role, _ := roleVal.(string)

	disputes, err := h.disputeUC.GetDisputes(role, uid)
	if err != nil {
		response.Error(c, response.ErrInternal("Gagal memuat daftar sengketa"))
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat sengketa", disputes)
}

// GET /api/disputes/:id
func (h *DisputeHandler) GetDisputeDetail(c *gin.Context) {
	disputeID := c.Param("id")

	dispute, messages, err := h.disputeUC.GetDisputeDetail(disputeID)
	if err != nil {
		response.Error(c, response.ErrNotFound(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Detail sengketa dimuat", map[string]interface{}{
		"dispute":  dispute,
		"messages": messages,
	})
}

// POST /api/disputes/:id/reply
// Body JSON: { "message": "Barang sudah sesuai resi!" }
func (h *DisputeHandler) ReplyDispute(c *gin.Context) {
	disputeID := c.Param("id")
	uidVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	uid, _ := uidVal.(string)

	var input struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, response.ErrBadRequest("Isi pesan tidak boleh kosong"))
		return
	}

	msg, err := h.disputeUC.AddReply(disputeID, uid, input.Message)
	if err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusCreated, "Pesan berhasil terkirim", msg)
}

// PUT /api/disputes/:id/resolve (Hanya Admin)
// Body JSON: { "decision": "REFUNDED", "admin_note": "Bukti pembeli kuat, uang dikembalikan." }
func (h *DisputeHandler) ResolveDispute(c *gin.Context) {
	disputeID := c.Param("id")
	adminVal, exists := c.Get("user_id")
	if !exists {
		response.Error(c, response.ErrUnauthorized("Sesi pengguna tidak valid"))
		return
	}
	adminID, _ := adminVal.(string)

	var input struct {
		Decision  string `json:"decision" binding:"required"`
		AdminNote string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.Error(c, response.ErrBadRequest("Keputusan resolusi tidak valid"))
		return
	}

	err := h.disputeUC.ResolveDispute(disputeID, adminID, input.Decision, input.AdminNote)
	if err != nil {
		response.Error(c, response.ErrBadRequest(err.Error()))
		return
	}

	response.Success(c, http.StatusOK, "Sengketa ditutup dan putusan telah dieksekusi", nil)
}
