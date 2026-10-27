@echo off
cd /d "%~dp0"
set PY=py
where py >nul 2>nul || set PY=python
%PY% -c "import openpyxl" 2>nul || (echo Installing openpyxl, one moment... & %PY% -m pip install -r requirements.txt)
%PY% app.py
pause
