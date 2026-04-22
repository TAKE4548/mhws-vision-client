# MHWs Talisman Vision - Development Environment Startup Script
# REQ-016: One-action startup with process management

$FrontendPath = Get-Location
$BackendPath = Join-Path (Get-Item .).Parent.FullName "mhws-vision-server"

# ポートごとにプロセスを停止する関数
function Stop-PortProcess {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping process on port $Port (PID: $($connection.OwningProcess), Name: $($process.Name))..." -ForegroundColor Yellow
            Stop-Process -Id $connection.OwningProcess -Force
            Write-Host "Done." -ForegroundColor Green
        } else {
            Write-Host "No process found on port $Port." -ForegroundColor Gray
        }
    } else {
        Write-Host "No process found on port $Port." -ForegroundColor Gray
    }
}

# バックエンド（FastAPI）を起動する関数
function Start-Backend {
    if (-not (Test-Path $BackendPath)) {
        Write-Error "Backend directory not found at $BackendPath"
        return
    }
    Write-Host "Starting Backend (FastAPI) at $BackendPath..." -ForegroundColor Cyan
    $PythonExec = Join-Path $BackendPath ".venv\Scripts\python.exe"
    Start-Process -FilePath $PythonExec -ArgumentList "-m uvicorn src.api.main:app --reload --port 8000" -WorkingDirectory $BackendPath -NoNewWindow
}

# フロントエンド（Vite）を起動する関数
function Start-Frontend {
    Write-Host "Starting Frontend (Vite) at $FrontendPath..." -ForegroundColor Cyan
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $FrontendPath -NoNewWindow
}

# ブラウザを開く関数
function Open-Browser {
    Write-Host "Opening browser at http://localhost:5173..." -ForegroundColor Cyan
    Start-Process "http://localhost:5173"
}

# メニューを表示する関数
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
    
    # フロントエンドが実行中かどうかを確認
    $isFrontendRunning = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($isFrontendRunning) {
        Write-Host "[5] Open Dashboard in Browser" -ForegroundColor Green
    }
    
    Write-Host "[0] Exit"
    Write-Host ""
}

# メインループ
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
