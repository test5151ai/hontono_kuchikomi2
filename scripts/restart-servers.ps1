function Restart-Servers {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    taskkill /F /IM node.exe 2>$null
    Start-Sleep -Seconds 2  # プロセスが完全に終了するのを待つ
    
    # フロントエンドサーバーを起動
    Write-Host "`nStarting frontend server..." -ForegroundColor Cyan
    $frontendPath = Resolve-Path "$PSScriptRoot/../frontend"
    Set-Location $frontendPath
    Start-Process npm -ArgumentList "run", "dev" -NoNewWindow -PassThru
    
    # バックエンドサーバーを起動
    Write-Host "`nStarting backend server..." -ForegroundColor Cyan
    $backendPath = Resolve-Path "$PSScriptRoot/../backend"
    Set-Location $backendPath
    Start-Process npm -ArgumentList "run", "dev" -NoNewWindow -PassThru
    
    Set-Location -Path "$PSScriptRoot/.."
    Write-Host "`nAll servers started!" -ForegroundColor Green
}

Export-ModuleMember -Function Restart-Servers 