# 🧵 Hashmi Fabrics — Business Management System

Full-stack business management system for Hashmi Fabrics clothing shop.

## Tech Stack
- **Backend:** Laravel 12 + MySQL
- **Frontend:** React 18 + Vite + Tailwind CSS

## Local Setup

### Requirements
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL (XAMPP recommended)

### Backend
cd backend
composer install
copy .env.example .env
php artisan key:generate
# .env mein DB details bharo
php artisan serve --host=127.0.0.1 --port=8000

### Frontend
cd frontend
npm install
npm run dev

### Database
MySQL mein `hashmi_fabrics` database banao
SQL file run karo tables ke liye

## URLs
- Frontend: http://127.0.0.1:5173
- Backend API: http://127.0.0.1:8000/api/v1
