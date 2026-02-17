@echo off
TITLE Wallet Accounting System
ECHO Starting System...

:: 1. Enter the backend folder
cd backend

:: 2. Activate Virtual Environment
call venv\Scripts\activate

:: 3. Open Browser (it will wait for server to load)
start http://127.0.0.1:8000

:: 4. Run Server (0.0.0.0 allows other computers to connect too)
python manage.py runserver 0.0.0.0:8000

pause