$fire = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x94, 0xA5)) 
$skull = [System.Text.Encoding]::UTF8.GetString([byte[]](0xF0, 0x9F, 0x92, 0x80)) 

# Build the frontend
Write-Host "Building frontend..." -ForegroundColor Green
npm run build

# Deploy to Firebase
Write-Host "Deploying to Firebase..." -ForegroundColor Green
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Firebase deploy failed, trying --only hosting..." -ForegroundColor Yellow
    firebase deploy --only hosting
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("Still failed... Go ask ChatGPT! bruh moment " + $skull) -ForegroundColor Red
        exit 1
    }
}

Write-Host ("NICE! Deployment successful! " + $fire) -ForegroundColor Green
