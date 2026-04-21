@echo off
setlocal
set APP_PORT=3005

cd /d "%~dp0"

echo Starting Buildynex AI...
echo Using Turbopack dev mode on port %APP_PORT%...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%APP_PORT%" ^| findstr "LISTENING"') do (
  echo Stopping old Buildynex server on port %APP_PORT%...
  taskkill /PID %%a /F >nul 2>nul
)

if not exist node_modules (
  echo Dependencies not found. Installing packages first...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

if not exist .env.local (
  echo Warning: .env.local was not found.
  echo Firebase features will not work until you add your real environment variables.
  echo.
)

if exist .next (
  echo Clearing stale Next.js cache...
  rmdir /s /q .next
)

start "Buildynex AI Dev Server" cmd /k "cd /d ""%~dp0"" && npm.cmd run dev -- --turbopack --port %APP_PORT%"

if exist "%~dp0launching.html" (
  echo Opening Buildynex loading screen...
  start "" "%~dp0launching.html"
) else (
  echo Opening Buildynex AI in your browser...
  start "" http://localhost:%APP_PORT%
)

exit /b 0
