@echo off
TITLE Installing System Requirements...
ECHO ==========================================
ECHO   SETTING UP YOUR ACCOUNTING SYSTEM
ECHO   (This only needs to be done once)
ECHO ==========================================
ECHO.

:: 1. Go into backend folder
cd backend

:: 2. Create the virtual environment
ECHO Creating virtual environment...
python -m venv venv

:: 3. Activate it
call venv\Scripts\activate

:: 4. Install dependencies
ECHO Installing software libraries...
pip install -r requirements.txt

:: 5. Set up the database
ECHO Setting up the database...
python manage.py migrate

:: 6. Create an Admin User (Optional - interactive)
ECHO.
ECHO Create your Admin Account (Skip if already done)
python manage.py createsuperuser

ECHO.
ECHO ==========================================
ECHO   INSTALLATION COMPLETE!
ECHO   You can now use "StartAccounting.bat"
ECHO ==========================================
pause