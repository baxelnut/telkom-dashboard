$fire = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x94, 0xA5)) 
$skull = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x92, 0x80)) 

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm run build

# Deploy to Firebase (to rso2 target)
Write-Host "Deploying to Firebase (rso2-telkom-dashboard)..." -ForegroundColor Green
firebase deploy --only hosting:rso2
if ($LASTEXITCODE -ne 0) {
    Write-Host "Firebase deploy failed, trying --only hosting:rso2 again..." -ForegroundColor Yellow
    firebase deploy --only hosting:rso2
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("Still failed... Go ask ChatGPT! bruh moment " + $skull) -ForegroundColor Red
        exit 1
    }
}

Write-Host ("NICE! Deployment successful! " + $fire) -ForegroundColor Green
Write-Host "You can view the deployed site at: https://rso2-telkom-dashboard.web.app" -ForegroundColor Green 