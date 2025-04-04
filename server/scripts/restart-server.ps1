# Kill process on port 9005
Write-Host "Killing process on port 9005..."
npx kill-port 9005

# Wait a moment for the port to be released
Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting server..."
npm run dev 