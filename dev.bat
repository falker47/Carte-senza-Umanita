@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Carte Senza Umanita - Dev Server

echo ======================================================
echo   Carte Senza Umanita - Avvio ambiente di sviluppo
echo ======================================================
echo.

cd /d "%~dp0"

:: --- Verifica Node.js ---
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Node.js non trovato nel PATH.
    echo Installa Node.js LTS da https://nodejs.org/ e riprova.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js rilevato: !NODE_VERSION!
echo.

:: --- Installazione dipendenze root ---
if not exist "node_modules" (
    echo [INFO] Installazione dipendenze root...
    call npm install
    if errorlevel 1 (
        echo [ERRORE] Installazione root fallita.
        pause
        exit /b 1
    )
) else (
    echo [OK] Dipendenze root gia' installate.
)

:: --- Installazione dipendenze client ---
if not exist "client\node_modules" (
    echo [INFO] Installazione dipendenze client...
    pushd client
    call npm install
    if errorlevel 1 (
        echo [ERRORE] Installazione client fallita.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo [OK] Dipendenze client gia' installate.
)

:: --- Installazione dipendenze server ---
if not exist "server\node_modules" (
    echo [INFO] Installazione dipendenze server...
    pushd server
    call npm install
    if errorlevel 1 (
        echo [ERRORE] Installazione server fallita.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo [OK] Dipendenze server gia' installate.
)

echo.
echo ======================================================
echo   Avvio server (porta 3001) + client (porta 5173)
echo   Premi CTRL+C per fermare entrambi i processi.
echo ======================================================
echo.

:: --- Apri il browser dopo 4 secondi (in background) ---
start "" /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:5173"

:: --- Avvia dev (usa concurrently definito in package.json) ---
call npm run dev

echo.
echo [INFO] Server di sviluppo arrestati.
pause
endlocal
