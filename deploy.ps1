$fire = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x94, 0xA5)) 
$skull = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x92, 0x80)) 

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm run build

# Deploy to Firebase (default site for new project)
Write-Host "Deploying to Firebase (rso2telkomdashboard)..." -ForegroundColor Green
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "Firebase deploy failed, retrying..." -ForegroundColor Yellow
    firebase deploy --only hosting
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("Still failed... Go ask ChatGPT! bruh moment " + $skull) -ForegroundColor Red
        exit 1
    }
}

Write-Host ("NICE! Deployment successful! " + $fire) -ForegroundColor Green
Write-Host "You can view the deployed site at: https://rso2telkomdashboard.web.app" -ForegroundColor Green