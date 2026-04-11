$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList '-NoExit', "cd '$root\\equeue-backend'; npm run dev"
Start-Process powershell -ArgumentList '-NoExit', "cd '$root\\equeue-frontend'; npm run dev"
