package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

const baseURL = "http://localhost:8080"

type LoadTestResult struct {
	Endpoint       string
	TotalRequests  int
	Concurrency    int
	Duration       time.Duration
	SuccessCount   int64
	ErrorCount     int64
	Latencies      []time.Duration
	StatusCodes    map[int]int
}

func (r *LoadTestResult) Print() {
	sort.Slice(r.Latencies, func(i, j int) bool { return r.Latencies[i] < r.Latencies[j] })

	var totalLatency time.Duration
	for _, l := range r.Latencies {
		totalLatency += l
	}

	avgLatency := time.Duration(0)
	p50 := time.Duration(0)
	p95 := time.Duration(0)
	p99 := time.Duration(0)

	if len(r.Latencies) > 0 {
		avgLatency = totalLatency / time.Duration(len(r.Latencies))
		p50 = r.Latencies[len(r.Latencies)*50/100]
		p95 = r.Latencies[len(r.Latencies)*95/100]
		if len(r.Latencies) > 1 {
			p99 = r.Latencies[len(r.Latencies)*99/100]
		}
	}

	rps := float64(r.TotalRequests) / r.Duration.Seconds()

	fmt.Println("╔══════════════════════════════════════════════════════════════╗")
	fmt.Printf("║  LOAD TEST: %-48s║\n", r.Endpoint)
	fmt.Println("╠══════════════════════════════════════════════════════════════╣")
	fmt.Printf("║  Total Requests   : %-40d║\n", r.TotalRequests)
	fmt.Printf("║  Concurrency      : %-40d║\n", r.Concurrency)
	fmt.Printf("║  Duration         : %-40s║\n", r.Duration.Round(time.Millisecond))
	fmt.Printf("║  Throughput (RPS) : %-40.2f║\n", rps)
	fmt.Println("╠══════════════════════════════════════════════════════════════╣")
	fmt.Printf("║  ✅ Success        : %-40d║\n", r.SuccessCount)
	fmt.Printf("║  ❌ Errors         : %-40d║\n", r.ErrorCount)
	fmt.Printf("║  Error Rate       : %-40s║\n", fmt.Sprintf("%.2f%%", float64(r.ErrorCount)/float64(r.TotalRequests)*100))
	fmt.Println("╠══════════════════════════════════════════════════════════════╣")
	fmt.Printf("║  Avg Latency      : %-40s║\n", avgLatency.Round(time.Microsecond))
	fmt.Printf("║  P50 Latency      : %-40s║\n", p50.Round(time.Microsecond))
	fmt.Printf("║  P95 Latency      : %-40s║\n", p95.Round(time.Microsecond))
	fmt.Printf("║  P99 Latency      : %-40s║\n", p99.Round(time.Microsecond))
	fmt.Println("╠══════════════════════════════════════════════════════════════╣")
	fmt.Printf("║  Status Codes:                                              ║\n")
	for code, count := range r.StatusCodes {
		fmt.Printf("║    HTTP %d : %-49d║\n", code, count)
	}
	fmt.Println("╚══════════════════════════════════════════════════════════════╝")
	fmt.Println()
}

func runLoadTest(method, endpoint string, headers map[string]string, body interface{}, totalRequests, concurrency int) *LoadTestResult {
	result := &LoadTestResult{
		Endpoint:    fmt.Sprintf("%s %s", method, endpoint),
		TotalRequests: totalRequests,
		Concurrency: concurrency,
		StatusCodes: make(map[int]int),
	}

	var successCount int64
	var errorCount int64
	var mu sync.Mutex
	var latencies []time.Duration

	sem := make(chan struct{}, concurrency)
	var wg sync.WaitGroup

	startTime := time.Now()

	for i := 0; i < totalRequests; i++ {
		wg.Add(1)
		sem <- struct{}{}

		go func() {
			defer wg.Done()
			defer func() { <-sem }()

			var reqBody io.Reader
			if body != nil {
				jsonBytes, _ := json.Marshal(body)
				reqBody = bytes.NewReader(jsonBytes)
			}

			req, err := http.NewRequest(method, baseURL+endpoint, reqBody)
			if err != nil {
				atomic.AddInt64(&errorCount, 1)
				return
			}
			req.Header.Set("Content-Type", "application/json")
			for k, v := range headers {
				req.Header.Set(k, v)
			}

			reqStart := time.Now()
			resp, err := http.DefaultClient.Do(req)
			latency := time.Since(reqStart)

			if err != nil {
				atomic.AddInt64(&errorCount, 1)
				return
			}
			defer resp.Body.Close()
			io.ReadAll(resp.Body)

			mu.Lock()
			latencies = append(latencies, latency)
			result.StatusCodes[resp.StatusCode]++
			mu.Unlock()

			if resp.StatusCode >= 200 && resp.StatusCode < 400 {
				atomic.AddInt64(&successCount, 1)
			} else {
				atomic.AddInt64(&errorCount, 1)
			}
		}()
	}

	wg.Wait()
	result.Duration = time.Since(startTime)
	result.SuccessCount = successCount
	result.ErrorCount = errorCount
	result.Latencies = latencies

	return result
}

// Login dan ambil token
func getToken(email, password string) string {
	body := map[string]string{"email": email, "password": password}
	jsonBytes, _ := json.Marshal(body)

	resp, err := http.Post(baseURL+"/api/v1/auth/login", "application/json", bytes.NewReader(jsonBytes))
	if err != nil {
		fmt.Printf("❌ Gagal login: %v\n", err)
		return ""
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Since we are using standard pkg/response format, token is in data.token
	dataObj, okData := result["data"].(map[string]interface{})
	if !okData {
		fmt.Println("❌ Response data tidak sesuai format pkg/response")
		return ""
	}

	token, ok := dataObj["token"].(string)
	if !ok {
		fmt.Println("❌ Token tidak ditemukan di response login")
		return ""
	}
	return token
}

func main() {
	fmt.Println("🔥 ═══════════════════════════════════════════════════════════")
	fmt.Println("🔥  E-COMMERCE SQA — STRESS / LOAD TEST")
	fmt.Println("🔥  Target: http://localhost:8080")
	fmt.Println("🔥 ═══════════════════════════════════════════════════════════")
	fmt.Println()

	// --- Test 1: Public GET endpoint (tanpa auth) ---
	fmt.Println("📡 Test 1: GET /api/v1/products (Public — 500 requests, 50 concurrent)")
	r1 := runLoadTest("GET", "/api/v1/products", nil, nil, 500, 50)
	r1.Print()

	// --- Test 2: Public GET endpoint (high load) ---
	fmt.Println("📡 Test 2: GET /api/v1/products (Public — 1000 requests, 100 concurrent)")
	r2 := runLoadTest("GET", "/api/v1/products", nil, nil, 1000, 100)
	r2.Print()

	// --- Ambil token untuk test berikutnya ---
	fmt.Println("🔑 Mengambil JWT token untuk testing endpoint yang dilindungi...")
	token := getToken("admin@ecommerce.com", "password123") // Make sure to use a valid robust test user
	if token == "" {
		fmt.Println("❌ Gagal mendapatkan token. Pastikan server berjalan dan database sudah di-seed.")
		return
	}
	fmt.Println("✅ Token diperoleh!")
	fmt.Println()

	// --- Test 3: Login endpoint (auth stress) ---
	fmt.Println("📡 Test 3: POST /api/v1/auth/login (Auth — 200 requests, 50 concurrent)")
	loginBody := map[string]string{"email": "pembeli@ecommerce.com", "password": "password123"}
	r3 := runLoadTest("POST", "/api/v1/auth/login", nil, loginBody, 200, 50)
	r3.Print()

	authHeaders := map[string]string{
		"Authorization": "Bearer " + token,
	}

	// --- Test 4: Protected GET (View Cart) ---
	fmt.Println("📡 Test 4: GET /api/v1/cart (Auth — 500 requests, 50 concurrent)")
	r4 := runLoadTest("GET", "/api/v1/cart", authHeaders, nil, 500, 50)
	r4.Print()

	// --- Test 5: Health Check (baseline) ---
	fmt.Println("📡 Test 5: GET /api/v1/health (Baseline — 2000 requests, 200 concurrent)")
	r5 := runLoadTest("GET", "/api/v1/health", nil, nil, 2000, 200)
	r5.Print()

	// --- SUMMARY ---
	fmt.Println("═══════════════════════════════════════════════════════════════")
	fmt.Println("  📊 RINGKASAN LOAD TEST")
	fmt.Println("═══════════════════════════════════════════════════════════════")
	tests := []*LoadTestResult{r1, r2, r3, r4, r5}
	fmt.Printf("  %-45s %8s %8s %8s\n", "Endpoint", "RPS", "Avg(ms)", "Err%")
	fmt.Println("  " + "─────────────────────────────────────────────────────────────")
	for _, t := range tests {
		rps := float64(t.TotalRequests) / t.Duration.Seconds()
		var totalLat time.Duration
		for _, l := range t.Latencies {
			totalLat += l
		}
		avgMs := float64(0)
		if len(t.Latencies) > 0 {
			avgMs = float64(totalLat.Milliseconds()) / float64(len(t.Latencies))
		}
		errPct := float64(t.ErrorCount) / float64(t.TotalRequests) * 100
		fmt.Printf("  %-45s %8.1f %8.1f %7.1f%%\n", t.Endpoint, rps, avgMs, errPct)
	}
	fmt.Println("═══════════════════════════════════════════════════════════════")
}
