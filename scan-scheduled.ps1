# career-ops weekly scan
# Runs automatically via Windows Task Scheduler (Tuesdays 2AM CST)
# Triggered by: CareerOps-WeeklyScan scheduled task

$projectDir = "C:\Users\danie\Dropbox\claudeCodex\JobSearch\career-ops-dml"
$logDir     = Join-Path $projectDir "logs"
$logFile    = Join-Path $logDir "scan.log"

# Ensure logs directory exists
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "[$timestamp] === career-ops weekly scan starting ==="

Set-Location $projectDir

# Run the scan unattended
# --dangerously-skip-permissions allows file reads/writes without prompts
& claude --dangerously-skip-permissions -p "/career-ops scan" 2>&1 | Tee-Object -FilePath $logFile -Append

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "[$timestamp] === scan complete ==="
