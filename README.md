# Event Finance Management System
A full-stack finance and project wallet management platform designed for event organizer operations.

## Tech Stack
### Frontend
- React
- Vite
- TypeScript

### Backend
- Django REST Framework
- PostgreSQL

## Features (Planned)
- Company Wallet
- Project Wallets
- Multi-bank source tracking
- Cash flow tracking
- Real-time fund locking
- RAB monitoring & validation
- Audit logs
- Permissions (Admin / Finance / PM)

## Folder Structure
wallet-accounting-system/
backend/
frontend/

## Getting Started
### Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### Frontend
npm install
npm run dev