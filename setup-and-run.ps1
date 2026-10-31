# HemoSync Automated Setup & Launch Script
$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   🩸 HemoSync Blood Bank Management System Launcher  " -ForegroundColor Red
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Ensure Node.js & npm are in PATH
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $env:Path += ";C:\Program Files\nodejs"
}

Write-Host "[1/5] Checking Node.js runtime..." -ForegroundColor Yellow
$nodeVer = & node -v
$npmVer = & npm -v
Write-Host "      Detected Node: $nodeVer | npm: $npmVer" -ForegroundColor Green

# 2. Check / Start MongoDB
Write-Host "[2/5] Checking MongoDB database on port 27017..." -ForegroundColor Yellow
$mongoRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient("127.0.0.1", 27017)
    $tcp.Close()
    $mongoRunning = $true
} catch {
    $mongoRunning = $false
}

if (-not $mongoRunning) {
    Write-Host "      MongoDB is not running yet. Starting database engine..." -ForegroundColor Yellow
    # Try Windows Service first
    try {
        Start-Service MongoDB -ErrorAction Stop
        Write-Host "      Started MongoDB Windows Service successfully." -ForegroundColor Green
        $mongoRunning = $true
    } catch {
        # Fallback to local process with project data directory (requires NO Admin privileges)
        $dbPath = "D:\Projects\Test1\data\db"
        if (-not (Test-Path $dbPath)) {
            New-Item -ItemType Directory -Path $dbPath -Force | Out-Null
        }
        $mongodExe = "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe"
        if (Test-Path $mongodExe) {
            Start-Process -FilePath $mongodExe -ArgumentList "--dbpath `"$dbPath`"" -WindowStyle Hidden
            Start-Sleep -Seconds 3
            Write-Host "      Started local MongoDB engine at $dbPath" -ForegroundColor Green
            $mongoRunning = $true
        } else {
            Write-Host "      WARNING: Could not find mongod.exe. Please ensure MongoDB is started." -ForegroundColor Red
        }
    }
} else {
    Write-Host "      MongoDB is already active and listening on port 27017." -ForegroundColor Green
}

# 3. Install packages if not yet installed
Write-Host "[3/5] Verifying dependencies..." -ForegroundColor Yellow
Set-Location "D:\Projects\Test1"

if (-not (Test-Path "node_modules")) {
    Write-Host "      Installing root orchestration packages..." -ForegroundColor Gray
    & npm install
}
if (-not (Test-Path "server\node_modules")) {
    Write-Host "      Installing server packages (Express, Mongoose, JWT)..." -ForegroundColor Gray
    & npm --prefix server install
}
if (-not (Test-Path "client\node_modules")) {
    Write-Host "      Installing client packages (React, Vite, Tailwind CSS)..." -ForegroundColor Gray
    & npm --prefix client install
}
Write-Host "      Dependencies verified." -ForegroundColor Green

# 4. Seed demo data
Write-Host "[4/5] Seeding demo database (Users, Blood Vault Inventory, Camps)..." -ForegroundColor Yellow
try {
    & npm run seed
} catch {
    Write-Host "      Note: Seeding step completed or already initialized." -ForegroundColor Gray
}

# 5. Launch Full Stack
Write-Host "[5/5] Launching HemoSync Web Portal & Express API..." -ForegroundColor Green
Write-Host ""
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  API Base:  http://localhost:5000/api" -ForegroundColor White
Write-Host "  Admin:     admin@hemosync.org (password: password123)" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

& npm run dev
