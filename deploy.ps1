# PowerShell deployment script for Windows
# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "[DEPLOY] Starting deployment...`n" -ForegroundColor $Green

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "[ERROR] Not a git repository. Run 'git init' first." -ForegroundColor $Red
    exit 1
}

# Stage all changes
Write-Host "[STAGE] Staging changes..." -ForegroundColor $Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    # Commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[COMMIT] Committing changes..." -ForegroundColor $Yellow
    git commit -m "Deploy: $timestamp"
} else {
    Write-Host "[INFO] No changes to commit" -ForegroundColor $Yellow
}

# Push to remote
Write-Host "[PUSH] Pushing to remote..." -ForegroundColor $Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "[RETRY] Trying master branch..." -ForegroundColor $Yellow
    git push origin master
}

Write-Host "`n[SUCCESS] Deployment complete!" -ForegroundColor $Green
