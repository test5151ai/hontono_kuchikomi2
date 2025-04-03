# PowerShell 5.1以降でUTF-8を使用
$OutputEncoding = [System.Text.Encoding]::UTF8
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# プロファイルが存在しない場合は作成
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# プロファイルにスクリプトのインポート行を追加
$scriptPath = "$PSScriptRoot/restart-servers.ps1"
$importLine = "Import-Module '$scriptPath'"

if (!(Select-String -Path $PROFILE -Pattern $importLine -SimpleMatch -Quiet)) {
    Add-Content -Path $PROFILE -Value "`n# 15ch.net サーバー再起動スクリプト"
    Add-Content -Path $PROFILE -Value $importLine
    Write-Host "プロファイルにスクリプトを追加しました。" -ForegroundColor Green
} else {
    Write-Host "スクリプトは既にプロファイルに追加されています。" -ForegroundColor Yellow
}

Write-Host "`n使い方："
Write-Host "1. PowerShellを再起動するか、'. $PROFILE' を実行してプロファイルを再読み込み"
Write-Host "2. 'Restart-Servers' コマンドを実行してサーバーを再起動" 