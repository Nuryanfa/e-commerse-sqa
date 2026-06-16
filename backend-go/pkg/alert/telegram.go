package alert

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// SendTelegramAlert sends a text message to the configured Telegram Chat.
// It fails silently (only logs to standard output) to prevent disrupting the main application flow.
func SendTelegramAlert(message string) {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")

	if botToken == "" || chatID == "" {
		// Log softly if not configured, useful for local development
		log.Println("[ALERT_SKIPPED] Telegram credentials not configured.")
		return
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)

	payload := map[string]string{
		"chat_id": chatID,
		"text":    message,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[ALERT_ERROR] Failed to marshal telegram payload: %v", err)
		return
	}

	// Use a short timeout so we don't hang the application
	client := http.Client{
		Timeout: 5 * time.Second,
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("[ALERT_ERROR] Failed to create telegram request: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// Execute asynchronously so it doesn't block the caller
	go func() {
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("[ALERT_ERROR] Failed to send telegram message: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("[ALERT_ERROR] Telegram API responded with status: %d", resp.StatusCode)
		}
	}()
}
