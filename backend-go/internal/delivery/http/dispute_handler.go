package http

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nuryanfa/e-commerse-sqa/internal/usecase"
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
	userID, _ := c.Get("userID")

	// Ambil input form-data karena mungkin ada gambar
	reason := c.PostForm("reason")
	if reason == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Alasan pengajuan komplain harus diisi"})
		return
	}

	imageURL := ""
	file, _ := c.FormFile("image")
	if file != nil {
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		uploadPath := filepath.Join("uploads", filename)
		if err := c.SaveUploadedFile(file, uploadPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengunggah gambar bukti"})
			return
		}
		imageURL = "/uploads/" + filename
	}

	dispute, err := h.disputeUC.OpenDispute(orderID, userID.(string), reason, imageURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Komplain sengketa berhasil diajukan, menunggu respons penjual.", "data": dispute})
}

// GET /api/disputes
func (h *DisputeHandler) GetMyDisputes(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	disputes, err := h.disputeUC.GetDisputes(role.(string), userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat daftar sengketa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Berhasil memuat sengketa", "data": disputes})
}

// GET /api/disputes/:id
func (h *DisputeHandler) GetDisputeDetail(c *gin.Context) {
	disputeID := c.Param("id")

	dispute, messages, err := h.disputeUC.GetDisputeDetail(disputeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Detail sengketa dimuat",
		"data": gin.H{
			"dispute":  dispute,
			"messages": messages,
		},
	})
}

// POST /api/disputes/:id/reply
// Body JSON: { "message": "Barang sudah sesuai resi!" }
func (h *DisputeHandler) ReplyDispute(c *gin.Context) {
	disputeID := c.Param("id")
	userID, _ := c.Get("userID")

	var input struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Isi pesan tidak boleh kosong"})
		return
	}

	msg, err := h.disputeUC.AddReply(disputeID, userID.(string), input.Message)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Pesan berhasil terkirim", "data": msg})
}

// PUT /api/disputes/:id/resolve (Hanya Admin)
// Body JSON: { "decision": "REFUNDED", "admin_note": "Bukti pembeli kuat, uang dikembalikan." }
func (h *DisputeHandler) ResolveDispute(c *gin.Context) {
	disputeID := c.Param("id")
	adminID, _ := c.Get("userID")

	var input struct {
		Decision  string `json:"decision" binding:"required"`
		AdminNote string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Keputusan resolusi tidak valid"})
		return
	}

	err := h.disputeUC.ResolveDispute(disputeID, adminID.(string), input.Decision, input.AdminNote)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Sengketa ditutup dan putusan telah dieksekusi"})
}
