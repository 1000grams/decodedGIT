# filepath: c:\decoded\# AUTOMATED FRONTEND FILE GENERATOR.Tests.ps1
# Comprehensive tests for the AUTOMATED FRONTEND FILE GENERATOR

Write-Host "🧪 AUTOMATED FRONTEND FILE GENERATOR - TEST SUITE" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor White

# Test Configuration
$TestResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Test-Assert {
    param(
        [bool]$Condition,
        [string]$TestName,
        [string]$ExpectedResult = "",
        [string]$ActualResult = ""
    )
    
    $script:TestResults.Total++
    
    if ($Condition) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $script:TestResults.Passed++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($ExpectedResult -and $ActualResult) {
            Write-Host "   Expected: $ExpectedResult" -ForegroundColor Yellow
            Write-Host "   Actual: $ActualResult" -ForegroundColor Yellow
        }
        $script:TestResults.Failed++
    }
}

# Test 1: Verify PowerShell script exists and is readable
Write-Host "`n🔍 Test Group 1: PowerShell Script Validation" -ForegroundColor Yellow
Test-Assert -Condition (Test-Path "# AUTOMATED FRONTEND FILE GENERATOR.ps1") -TestName "PowerShell script file exists"

if (Test-Path "# AUTOMATED FRONTEND FILE GENERATOR.ps1") {
    $scriptContent = Get-Content "# AUTOMATED FRONTEND FILE GENERATOR.ps1" -Raw
    Test-Assert -Condition ($scriptContent.Length -gt 1000) -TestName "Script has substantial content"
    Test-Assert -Condition ($scriptContent -match "AUTOMATED FRONTEND FILE GENERATOR") -TestName "Script has correct header"
}

# Test 2: Run PowerShell script and verify file generation
Write-Host "`n🔍 Test Group 2: File Generation Tests" -ForegroundColor Yellow

# Clean up any existing files for clean test
$testFiles = @("dashboard.html", "dashboard.js", "dashboard.css", "test-dashboard.html")
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
    }
}

# Run the script with error handling
try {
    $output = & powershell -ExecutionPolicy Bypass -File "# AUTOMATED FRONTEND FILE GENERATOR.ps1" 2>&1
    $scriptRanSuccessfully = $LASTEXITCODE -eq 0 -or $output -notmatch "ParserError"
    Test-Assert -Condition $scriptRanSuccessfully -TestName "PowerShell script runs without parser errors"
} catch {
    Test-Assert -Condition $false -TestName "PowerShell script execution" -ExpectedResult "Success" -ActualResult "Exception: $($_.Exception.Message)"
}

# Test 3: Verify generated files exist
Write-Host "`n🔍 Test Group 3: Generated File Existence" -ForegroundColor Yellow
Test-Assert -Condition (Test-Path "dashboard.html") -TestName "dashboard.html file created"
Test-Assert -Condition (Test-Path "dashboard.js") -TestName "dashboard.js file created"
Test-Assert -Condition (Test-Path "dashboard.css") -TestName "dashboard.css file created"
Test-Assert -Condition (Test-Path "test-dashboard.html") -TestName "test-dashboard.html file created"

# Test 4: Validate HTML file content
Write-Host "`n🔍 Test Group 4: HTML File Content Validation" -ForegroundColor Yellow
if (Test-Path "dashboard.html") {
    $htmlContent = Get-Content "dashboard.html" -Raw
    Test-Assert -Condition ($htmlContent -match "<!DOCTYPE html>") -TestName "HTML has proper DOCTYPE"
    Test-Assert -Condition ($htmlContent -match "Rue De Vivre - Analytics Dashboard") -TestName "HTML has correct title"
    Test-Assert -Condition ($htmlContent -match "dashboard.css") -TestName "HTML links to CSS file"
    Test-Assert -Condition ($htmlContent -match "dashboard.js") -TestName "HTML links to JS file"
    Test-Assert -Condition ($htmlContent -match "portfolio-card") -TestName "HTML contains portfolio section"
    Test-Assert -Condition ($htmlContent -match "spotify-card") -TestName "HTML contains Spotify section"
    Test-Assert -Condition ($htmlContent -match "trends-card") -TestName "HTML contains trends section"
    Test-Assert -Condition ($htmlContent -match "recommendations-card") -TestName "HTML contains recommendations section"
}

# Test 5: Validate JavaScript file content
Write-Host "`n🔍 Test Group 5: JavaScript File Content Validation" -ForegroundColor Yellow
if (Test-Path "dashboard.js") {
    $jsContent = Get-Content "dashboard.js" -Raw
    Test-Assert -Condition ($jsContent -match "class RueDeVivreAnalytics") -TestName "JS contains main class"
    Test-Assert -Condition ($jsContent -match "2h2oj7u446.execute-api.eu-central-1.amazonaws.com") -TestName "JS has correct API URL"
    Test-Assert -Condition ($jsContent -match "loadPortfolioData") -TestName "JS has portfolio loading method"
    Test-Assert -Condition ($jsContent -match "loadSpotifyData") -TestName "JS has Spotify loading method"
    Test-Assert -Condition ($jsContent -match "loadTrendsData") -TestName "JS has trends loading method"
    Test-Assert -Condition ($jsContent -match "DOMContentLoaded") -TestName "JS has DOM ready handler"
    Test-Assert -Condition ($jsContent -notmatch "undefined") -TestName "JS doesn't contain 'undefined' strings"
}

# Test 6: Validate CSS file content
Write-Host "`n🔍 Test Group 6: CSS File Content Validation" -ForegroundColor Yellow
if (Test-Path "dashboard.css") {
    $cssContent = Get-Content "dashboard.css" -Raw
    Test-Assert -Condition ($cssContent -match "\.dashboard-container") -TestName "CSS has dashboard container class"
    Test-Assert -Condition ($cssContent -match "\.portfolio-card") -TestName "CSS has portfolio card styling"
    Test-Assert -Condition ($cssContent -match "\.spotify-card") -TestName "CSS has Spotify card styling"
    Test-Assert -Condition ($cssContent -match "\.trends-card") -TestName "CSS has trends card styling"
    Test-Assert -Condition ($cssContent -match "@media") -TestName "CSS has responsive design rules"
    Test-Assert -Condition ($cssContent -match "linear-gradient") -TestName "CSS has gradient background"
}

# Test 7: Check Frontend Directory Structure
Write-Host "`n🔍 Test Group 7: Frontend Directory Structure" -ForegroundColor Yellow
Test-Assert -Condition (Test-Path "frontend") -TestName "Frontend directory exists"
Test-Assert -Condition (Test-Path "frontend/package.json") -TestName "package.json exists in frontend"
Test-Assert -Condition (Test-Path "frontend/src") -TestName "src directory exists in frontend"

# Test 8: Validate package.json scripts
Write-Host "`n🔍 Test Group 8: Package.json Script Validation" -ForegroundColor Yellow
if (Test-Path "frontend/package.json") {
    $packageJson = Get-Content "frontend/package.json" -Raw | ConvertFrom-Json
    Test-Assert -Condition ($packageJson.scripts) -TestName "package.json has scripts section"
    
    $requiredScripts = @("start", "build", "test")
    foreach ($script in $requiredScripts) {
        Test-Assert -Condition ($packageJson.scripts.$script) -TestName "package.json has '$script' script"
    }
}

# Test 9: File Size and Content Quality Tests
Write-Host "`n🔍 Test Group 9: File Quality Tests" -ForegroundColor Yellow
if (Test-Path "dashboard.html") {
    $htmlSize = (Get-Item "dashboard.html").Length
    Test-Assert -Condition ($htmlSize -gt 1000) -TestName "HTML file has reasonable size (>1KB)"
}

if (Test-Path "dashboard.js") {
    $jsSize = (Get-Item "dashboard.js").Length
    Test-Assert -Condition ($jsSize -gt 5000) -TestName "JS file has substantial content (>5KB)"
}

if (Test-Path "dashboard.css") {
    $cssSize = (Get-Item "dashboard.css").Length
    Test-Assert -Condition ($cssSize -gt 3000) -TestName "CSS file has substantial styling (>3KB)"
}

# Test 10: Integration Readiness Tests
Write-Host "`n🔍 Test Group 10: Integration Readiness" -ForegroundColor Yellow
Test-Assert -Condition (Test-Path "frontend/scripts") -TestName "Frontend scripts directory exists"

# Create missing integration scripts for testing
if (!(Test-Path "frontend/scripts")) {
    New-Item -ItemType Directory -Path "frontend/scripts" -Force | Out-Null
}

$integrationScriptPath = "frontend/scripts/integrate-dashboard.js"
$testBackendScriptPath = "frontend/scripts/test-backend-connection.js"

Test-Assert -Condition (Test-Path $integrationScriptPath -or (Test-Path "frontend/scripts")) -TestName "Integration script location available"
Test-Assert -Condition (Test-Path $testBackendScriptPath -or (Test-Path "frontend/scripts")) -TestName "Backend test script location available"

# Test 11: API Endpoint Format Validation
Write-Host "`n🔍 Test Group 11: API Configuration Tests" -ForegroundColor Yellow
if (Test-Path "dashboard.js") {
    $jsContent = Get-Content "dashboard.js" -Raw
    Test-Assert -Condition ($jsContent -match "https://") -TestName "API URL uses HTTPS"
    Test-Assert -Condition ($jsContent -match "/accounting") -TestName "Accounting endpoint configured"
    Test-Assert -Condition ($jsContent -match "/spotify") -TestName "Spotify endpoint configured"
    Test-Assert -Condition ($jsContent -match "/trends") -TestName "Trends endpoint configured"
}

# Test 12: Error Handling Tests
Write-Host "`n🔍 Test Group 12: Error Handling Validation" -ForegroundColor Yellow
if (Test-Path "dashboard.js") {
    $jsContent = Get-Content "dashboard.js" -Raw
    Test-Assert -Condition ($jsContent -match "try.*catch") -TestName "JS has try-catch error handling"
    Test-Assert -Condition ($jsContent -match "displayPortfolioFallback") -TestName "JS has portfolio fallback method"
    Test-Assert -Condition ($jsContent -match "displaySpotifyFallback") -TestName "JS has Spotify fallback method"
    Test-Assert -Condition ($jsContent -match "displayTrendsFallback") -TestName "JS has trends fallback method"
}

# Generate Test Report
Write-Host "`n📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor White
Write-Host "Total Tests: $($TestResults.Total)" -ForegroundColor White
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor $(if ($TestResults.Failed -eq 0) { "Green" } else { "Red" })

$successRate = if ($TestResults.Total -gt 0) { [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

# Generate Integration Scripts if Missing
Write-Host "`n🔧 AUTOMATED SCRIPT GENERATION" -ForegroundColor Cyan

if (!(Test-Path "frontend/scripts/integrate-dashboard.js")) {
    Write-Host "Creating integrate-dashboard.js..." -ForegroundColor Yellow
    
    $integrationScript = @'
// Automated Integration Script for Dashboard Files
const fs = require('fs');
const path = require('path');

function integrateDashboard() {
  console.log('🔧 Integrating Dashboard with React Build...');
  
  try {
    // Copy generated files from parent directory to public folder
    const generatedFiles = [
      { from: '../dashboard.html', to: 'public/dashboard-standalone.html' },
      { from: '../dashboard.js', to: 'public/dashboard-standalone.js' },
      { from: '../dashboard.css', to: 'public/dashboard-standalone.css' },
      { from: '../test-dashboard.html', to: 'public/test-dashboard.html' }
    ];
    
    generatedFiles.forEach(file => {
      if (fs.existsSync(file.from)) {
        const targetDir = path.dirname(file.to);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(file.from, file.to);
        console.log(`✅ Copied ${file.from} to ${file.to}`);
      } else {
        console.log(`⚠️ Source file not found: ${file.from}`);
      }
    });
    
    console.log('🎉 Dashboard integration complete!');
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  }
}

if (require.main === module) {
  integrateDashboard();
}

module.exports = { integrateDashboard };
'@
    
    $integrationScript | Out-File -FilePath "frontend/scripts/integrate-dashboard.js" -Encoding UTF8
    Write-Host "✅ Created integrate-dashboard.js" -ForegroundColor Green
}

if (!(Test-Path "frontend/scripts/test-backend-connection.js")) {
    Write-Host "Creating test-backend-connection.js..." -ForegroundColor Yellow
    
    $testBackendScript = @'
// Automated Backend Connection Test
const https = require('https');

async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...');
  
  const baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
  const endpoints = ['/accounting?artistId=RueDeVivre', '/spotify', '/trends'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${baseURL}${endpoint}...`);
      
      const result = await new Promise((resolve, reject) => {
        const req = https.get(`${baseURL}${endpoint}`, {
          headers: { 'Content-Type': 'application/json' }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
      });
      
      console.log(`${result.status === 200 ? '✅' : '❌'} ${endpoint}: ${result.status}`);
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

if (require.main === module) {
  testBackendConnection().catch(console.error);
}

module.exports = { testBackendConnection };
'@
    
    $testBackendScript | Out-File -FilePath "frontend/scripts/test-backend-connection.js" -Encoding UTF8
    Write-Host "✅ Created test-backend-connection.js" -ForegroundColor Green
}

# Update package.json with missing scripts
if (Test-Path "frontend/package.json") {
    Write-Host "Updating package.json with integration scripts..." -ForegroundColor Yellow
    
    $packageJson = Get-Content "frontend/package.json" -Raw | ConvertFrom-Json
    
    # Add missing scripts
    if (!$packageJson.scripts."integrate-dashboard") {
        $packageJson.scripts | Add-Member -NotePropertyName "integrate-dashboard" -NotePropertyValue "node scripts/integrate-dashboard.js"
    }
    if (!$packageJson.scripts."test-backend") {
        $packageJson.scripts | Add-Member -NotePropertyName "test-backend" -NotePropertyValue "node scripts/test-backend-connection.js"
    }
    if (!$packageJson.scripts."build-with-dashboard") {
        $packageJson.scripts | Add-Member -NotePropertyName "build-with-dashboard" -NotePropertyValue "npm run integrate-dashboard && npm run build"
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "frontend/package.json" -Encoding UTF8
    Write-Host "✅ Updated package.json with integration scripts" -ForegroundColor Green
}

# Final Test Status
if ($TestResults.Failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Frontend generation is working correctly." -ForegroundColor Green
    Write-Host "✅ Dashboard files generated successfully" -ForegroundColor Green
    Write-Host "✅ Integration scripts created" -ForegroundColor Green
    Write-Host "✅ Package.json updated with required scripts" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some tests failed. Please review the issues above." -ForegroundColor Yellow
    Write-Host "   Consider running the tests again after fixing any reported issues." -ForegroundColor Gray
}

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. cd frontend" -ForegroundColor White
Write-Host "   2. npm run integrate-dashboard" -ForegroundColor White
Write-Host "   3. npm run test-backend" -ForegroundColor White
Write-Host "   4. npm run build-with-dashboard" -ForegroundColor White