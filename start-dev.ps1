# MHWs Talisman Vision - Development Environment Startup Script
# REQ-016: One-action startup with process management

$FrontendPath = Get-Location
$BackendPath = Join-Path (Get-Item .).Parent.FullName "mhws-vision-server"

function Stop-PortProcess {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "Stopping process on port $Port (PID: $($connection.OwningProcess))..." -ForegroundColor Yellow
        Stop-Process -Id $connection.OwningProcess -Force
        Write-Host "Done." -ForegroundColor Green
    } else {
        Write-Host "No process found on port $Port." -ForegroundColor Gray
    }
}

function Start-Backend {
    if (-not (Test-Path $BackendPath)) {
        Write-Error "Backend directory not found at $BackendPath"
        return
    }
    Write-Host "Starting Backend (FastAPI) at $BackendPath..." -ForegroundColor Cyan
    $PythonExec = Join-Path $BackendPath ".venv\Scripts\python.exe"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$BackendPath`"; & `"$PythonExec`" -m uvicorn src.api.main:app --reload --port 8000"
}

function Start-Frontend {
    Write-Host "Starting Frontend (Vite) at $FrontendPath..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$FrontendPath`"; npm run dev"
}

function Open-Browser {
    Write-Host "Opening browser at http://localhost:5173..." -ForegroundColor Cyan
    Start-Process "http://localhost:5173"
}

function Show-Menu {
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host " MHWs-Vision Development Manager" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "Backend Path: $BackendPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[1] Start Both (Backend & Frontend)"
    Write-Host "[2] Start Backend Only"
    Write-Host "[3] Start Frontend Only"
    Write-Host "[4] Stop All (Port 8000 & 5173)"
    
    # Check if frontend is already running to show the browser option
    $isFrontendRunning = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($isFrontendRunning) {
        Write-Host "[5] Open Dashboard in Browser" -ForegroundColor Green
    }
    
    Write-Host "[0] Exit"
    Write-Host ""
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Select an option"
    
    switch ($choice) {
        "1" {
            Stop-PortProcess 8000
            Stop-PortProcess 5173
            Start-Backend
            Start-Frontend
            Write-Host "Waiting for servers to initialize..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
        "2" {
            Stop-PortProcess 8000
            Start-Backend
            Start-Sleep -Seconds 2
        }
        "3" {
            Stop-PortProcess 5173
            Start-Frontend
            Start-Sleep -Seconds 2
        }
        "4" {
            Stop-PortProcess 8000
            Stop-PortProcess 5173
            Write-Host "Cleanup completed." -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        "5" {
            Open-Browser
            Start-Sleep -Seconds 1
        }
        "0" {
            exit
        }
        default {
            Write-Host "Invalid choice, please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}
