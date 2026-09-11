# Automated Backup Script for Maa Kaushilya Convent School (MK Convent)
# Backs up SQLite Database safely and archives uploaded media files

$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupRoot = Join-Path $PSScriptRoot "..\backups"
$TargetDir = Join-Path $BackupRoot $Date

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

$DbSource = Join-Path $PSScriptRoot "..\prisma\dev.db"
$DbBackup = Join-Path $TargetDir "database.db"

if (Test-Path $DbSource) {
    Write-Host "Backing up database from $DbSource to $DbBackup..."
    Copy-Item -Path $DbSource -Destination $DbBackup -Force
    Write-Host "Database backup complete."
} else {
    Write-Warning "Database file not found at $DbSource"
}

$UploadsSource = Join-Path $PSScriptRoot "..\public\uploads"
$UploadsZip = Join-Path $TargetDir "uploads.zip"

if (Test-Path $UploadsSource) {
    Write-Host "Compressing media uploads folder to $UploadsZip..."
    Compress-Archive -Path "$UploadsSource\*" -DestinationPath $UploadsZip -Force
    Write-Host "Media files archived."
} else {
    Write-Warning "Uploads directory not found at $UploadsSource"
}

Write-Host "MK Convent School Backup successfully created at: $TargetDir"
