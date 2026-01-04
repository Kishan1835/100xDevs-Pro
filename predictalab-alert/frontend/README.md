# ITI Dashboard - React + Vite + Tailwind CSS

A React-based dashboard application for managing ITI (Industrial Training Institute) branches, students, machines, complaints, and maintenance activities.

## Features

- **Dashboard Overview**: Displays key metrics including total branches, students, machines, complaints, and technicians
- **Recent Complaints**: View recent complaints from different branches
- **ITI Score Visualization**: Interactive charts showing performance metrics across different cities
- **Responsive Design**: Built with Tailwind CSS for a modern, responsive UI
- **Navigation Sidebar**: Easy access to different sections including Dashboard, Map, Branches, Complaints, Maintenance, Reports, Auction, and Manufacturers

## Tech Stack

- **React** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **@tailwindcss/postcss** - PostCSS plugin for Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` (or the next available port if 5173 is in use).

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
predict/
├── src/
│   ├── assets/          # Images, SVGs, and static files
│   ├── components/      # React components
│   │   ├── Home.jsx     # Main dashboard component
│   │   ├── CarbonGlobalFilters.jsx
│   │   ├── GgProfile.jsx
│   │   ├── OuiDocument.jsx
│   │   └── SolarSaleSquareBroken.jsx
│   ├── App.jsx          # Main App component
│   ├── App.css          # App styles
│   ├── index.css        # Global styles with Tailwind
│   └── main.jsx         # Application entry point
├── public/              # Public assets
├── .github/             # GitHub configuration
│   └── copilot-instructions.md
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```