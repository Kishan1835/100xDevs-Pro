# Installation Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

## Setup Instructions

### 1. Clone/Copy the Project
```bash
cd C:\Users\ASUS\Desktop\predict
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- **React** (v19.2.0) - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** (v4.1.17) - Styling
- **React Router DOM** (v7.9.6) - Routing
- **Clerk** (v5.57.0) - Authentication
- **React Icons** (v5.5.0) - Icon library
- **Recharts** (v3.5.1) - Charts/Graphs
- **Google Maps React** - Map integration

### 3. Environment Setup
Create a `.env` file in the project root:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y3JlYXRpdmUtcmF2ZW4tODEuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### 4. Run Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## Project Structure
```
predict/
├── src/
│   ├── dashboard/          # Dashboard pages (NCVET, ATO, TO)
│   ├── components/         # Reusable components (Sidebar, Header)
│   ├── routes/             # Routing configuration
│   ├── pages/              # Public pages
│   ├── Services/           # API services
│   └── assets/             # Images, logos
├── public/                 # Static files
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use
If port 5173 is occupied, Vite will automatically use the next available port.

### Node Version Issues
Ensure you're using Node.js v18 or higher:
```bash
node --version
```

### Package Installation Errors
Clear cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Features
- ✅ Role-based authentication (NCVET, ATO, TO, Principal, etc.)
- ✅ Dynamic routing with protected routes
- ✅ Real-time machine monitoring (Tinybird integration)
- ✅ Responsive dashboard layouts
- ✅ Chart visualizations (Recharts)
- ✅ Google Maps integration

## Support
For issues or questions, check the README.md file.
