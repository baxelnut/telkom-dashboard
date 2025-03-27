# Run Vercel Production Deployment
vercel --prod | Tee-Object -FilePath deploy.log

# Extract the latest production URL from the log
$deployLog = Get-Content deploy.log
$prodUrl = $deployLog | Select-String -Pattern "https:\/\/backend-[\w-]+\.vercel\.app" | Select-Object -Last 1

# If a URL was found, set the alias
if ($prodUrl) {
    $url = $prodUrl.Matches.Value
    Write-Output "✅ New deployment URL: $url"
    vercel alias set $url backend-baxelnuts.vercel.app
} else {
    Write-Output "❌ Failed to get the new deployment URL"
    exit 1
}
