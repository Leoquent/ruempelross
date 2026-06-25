@echo off
title RuempelRoss - lokale Vorschau (localhost:8080)
cd /d "%~dp0site"
echo.
echo   RuempelRoss - lokale Vorschau
echo   ---------------------------------
echo   URL:     http://localhost:8080
echo   Beenden: Strg+C oder Fenster schliessen
echo.
start "" "http://localhost:8080"
py -m http.server 8080 || python -m http.server 8080
echo.
echo   Kein Python gefunden? Alternative im site-Ordner:  npx --yes serve -l 8080
pause
