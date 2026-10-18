@echo off
title AVELOR - Backend FastAPI
cd /d "%~dp0backend"
echo [AVELOR] Lancement du Backend FastAPI sur http://localhost:8000 ...
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
