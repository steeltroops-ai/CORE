# Test script to verify the complete Insights page flow

Write-Host "Testing CORE Insights Page Flow" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Step 1: Test backend health
Write-Host "\n1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
    Write-Host "   ✓ Backend is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Upload a test document
Write-Host "\n2. Uploading test document..." -ForegroundColor Yellow
$testDocument = @{
    title = "Quantum Computing Breakthrough"
    abstract = "A novel approach to quantum computing using superconducting qubits that demonstrates significant improvements in coherence time and gate fidelity."
    body = "This research presents a breakthrough in quantum computing technology through the development of advanced superconducting qubits. The work focuses on improving quantum coherence and reducing decoherence effects that have been major obstacles in quantum computing systems."
} | ConvertTo-Json

try {
    $uploadResult = Invoke-RestMethod -Uri "http://localhost:8000/ingest" -Method POST -ContentType "application/json" -Body $testDocument
    $analysisId = $uploadResult.analysis_id
    Write-Host "   ✓ Document uploaded successfully. Analysis ID: $analysisId" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Document upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Test comprehensive insights endpoint
Write-Host "\n3. Testing comprehensive insights endpoint..." -ForegroundColor Yellow
try {
    $insights = Invoke-RestMethod -Uri "http://localhost:8000/analysis/$analysisId/track1/comprehensive" -Method GET
    Write-Host "   ✓ Comprehensive insights retrieved successfully" -ForegroundColor Green
    Write-Host "   - Analysis ID: $($insights.analysis_id)" -ForegroundColor Cyan
    Write-Host "   - Title: $($insights.title)" -ForegroundColor Cyan
    Write-Host "   - Novelty Score: $($insights.basic_analysis.novelty_score)" -ForegroundColor Cyan
} catch {
    Write-Host "   ✗ Comprehensive insights failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test individual insight endpoints
Write-Host "\n4. Testing individual insight endpoints..." -ForegroundColor Yellow

# Test Novelty Assessment
try {
    $novelty = Invoke-RestMethod -Uri "http://localhost:8000/analysis/$analysisId/track1/novelty" -Method GET
    Write-Host "   ✓ Novelty Assessment endpoint working" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Novelty Assessment failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Competitive Intelligence
try {
    $competitive = Invoke-RestMethod -Uri "http://localhost:8000/analysis/$analysisId/track1/competitive" -Method GET
    Write-Host "   ✓ Competitive Intelligence endpoint working" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Competitive Intelligence failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Strategic Insights
try {
    $strategic = Invoke-RestMethod -Uri "http://localhost:8000/analysis/$analysisId/track1/strategic" -Method GET
    Write-Host "   ✓ Strategic Insights endpoint working" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Strategic Insights failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Commercialization
try {
    $commercialization = Invoke-RestMethod -Uri "http://localhost:8000/analysis/$analysisId/track1/commercialization" -Method GET
    Write-Host "   ✓ Commercialization endpoint working" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Commercialization failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test frontend API proxy
Write-Host "\n5. Testing frontend API proxy..." -ForegroundColor Yellow
try {
    $frontendInsights = Invoke-RestMethod -Uri "http://localhost:3000/api/analysis/$analysisId/track1/comprehensive" -Method GET
    Write-Host "   ✓ Frontend API proxy working correctly" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend API proxy failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "\n================================" -ForegroundColor Green
Write-Host "Test completed! Analysis ID for manual testing: $analysisId" -ForegroundColor Green
Write-Host "You can now navigate to http://localhost:3000 and test the Insights page" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green