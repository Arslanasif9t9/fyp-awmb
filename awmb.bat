@echo off
setlocal
cd /d "%~dp0"

set "CMD=%~1"
if "%CMD%"=="" goto help
if /i "%CMD%"=="setup"   goto setup
if /i "%CMD%"=="run"     goto run
if /i "%CMD%"=="migrate" goto migrate
if /i "%CMD%"=="admin"   goto admin
if /i "%CMD%"=="test"    goto test
goto help

:setup
py -3.12 --version >nul 2>&1
if errorlevel 1 (
  echo Python 3.12 not found. Install it with:  winget install Python.Python.3.12
  exit /b 1
)
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example. Open it and fill DATABASE_URL and JWT_SECRET.
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo Creating virtual environment...
  py -3.12 -m venv backend\.venv
)
echo Installing packages...
"backend\.venv\Scripts\python.exe" -m pip install --upgrade pip -q
"backend\.venv\Scripts\python.exe" -m pip install -r backend\requirements.txt -q
if errorlevel 1 exit /b 1
echo.
echo Setup done. Next:  .\awmb migrate
exit /b 0

:migrate
call :need_venv
if errorlevel 1 exit /b 1
call :need_env
if errorlevel 1 exit /b 1
pushd backend
".venv\Scripts\python.exe" -m alembic upgrade head
set "RC=%errorlevel%"
popd
if not "%RC%"=="0" (
  echo Migration failed. Check DATABASE_URL in .env
  exit /b 1
)
echo Database is ready. Next:  .\awmb admin
exit /b 0

:admin
call :need_venv
if errorlevel 1 exit /b 1
call :need_env
if errorlevel 1 exit /b 1
pushd backend
".venv\Scripts\python.exe" -m app.cli create-admin
set "RC=%errorlevel%"
popd
exit /b %RC%

:run
call :need_venv
if errorlevel 1 exit /b 1
call :need_env
if errorlevel 1 exit /b 1
echo.
echo   AI World Model Builder API
echo   Docs:  http://localhost:8000/docs
echo   Stop:  Ctrl + C
echo.
pushd backend
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
popd
exit /b 0

:test
call :need_venv
if errorlevel 1 exit /b 1
pushd backend
".venv\Scripts\python.exe" -m pytest -q
set "RC=%errorlevel%"
popd
exit /b %RC%

:need_venv
if not exist "backend\.venv\Scripts\python.exe" (
  echo Not set up yet. Run:  .\awmb setup
  exit /b 1
)
exit /b 0

:need_env
if not exist ".env" (
  echo .env file is missing. Run:  .\awmb setup
  exit /b 1
)
exit /b 0

:help
echo.
echo   AI World Model Builder - commands
echo.
echo     .\awmb setup     first time: create venv and install packages
echo     .\awmb migrate   create or update database tables
echo     .\awmb admin     create the admin user
echo     .\awmb run       start the backend (http://localhost:8000/docs)
echo     .\awmb test      run the tests
echo.
exit /b 0
