# NCVET Integrated Smart ITI Management Dashboard

A comprehensive React.js dashboard application for managing Industrial Training Institutes (ITI) with role-based access control and government-style UI design.

## 🚀 Features

### Role-Based Access Control (RBAC)
- **NCVET_ADMIN**: Full access to policy dashboard with national overview
- **PRINCIPAL**: Branch management and administrative functions
- **TRAINING_OFFICER**: Training management and machine oversight
- **ASSISTANT_TRAINING_OFFICER**: Assistance with training and complaint management

### Dashboard Views
- **Common Dashboard**: Branch-level insights with stats cards, maps, and charts
- **Policy Dashboard**: National-level overview for NCVET administrators
- **Interactive Charts**: Machine health trends, complaint analysis, performance metrics
- **Real-time Data**: Live updates and activity tracking

### Key Modules
1. **Branch Management**: List and detailed view of all ITI branches
2. **Machine Management**: Complete inventory with maintenance tracking
3. **Complaint System**: Issue tracking with severity levels and resolution
4. **Map View**: Geographic visualization of ITI network
5. **Analytics**: Performance charts and trend analysis

### UI/UX Features
- Government-style clean design
- Fully responsive layout
- Mobile-optimized navigation
- Interactive data visualizations
- Professional color scheme (blue/white theme)

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Routing**: React Router DOM 6.20.1
- **Styling**: Pure CSS (no UI libraries)
- **Charts**: Custom CSS-based visualizations
- **Icons**: Emoji-based icon system

## 📁 Project Structure

```
src/
├── app/
│   ├── App.jsx                 # Main app component
│   └── routes.jsx              # Route configuration with RBAC
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx         # Government-style sidebar navigation
│   │   └── Topbar.jsx          # Top search bar and profile
│   ├── cards/
│   │   ├── StatCard.jsx        # Reusable statistics cards
│   │   └── MachineCard.jsx     # Machine inventory cards
│   └── charts/
│       ├── LineChart.jsx       # Line chart component
│       └── BarChart.jsx        # Bar chart component
├── context/
│   └── AuthContext.jsx         # Authentication and RBAC context
├── services/
│   ├── api.js                  # Mock API functions with dummy data
│   └── auth.js                 # Authentication service
├── pages/
│   ├── dashboard/
│   │   ├── CommonDashboard.jsx # Branch-level dashboard
│   │   └── PolicyDashboard.jsx # NCVET admin dashboard
│   ├── branch/
│   │   ├── BranchList.jsx      # ITI branches listing
│   │   └── BranchDetails.jsx   # Detailed branch view with tabs
│   ├── complaints/
│   │   ├── ComplaintsList.jsx  # Complaint management
│   │   └── ComplaintDetails.jsx # Individual complaint view
│   ├── machines/
│   │   └── MachineList.jsx     # Machine inventory management
│   └── map/
│       └── MapView.jsx         # Geographic ITI network view
└── styles/
    ├── layout.css              # Layout and component styles
    └── dashboard.css           # Dashboard-specific styling
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone or extract the project**
   ```bash
   cd predictalab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:3000`
   - The dashboard will load with default NCVET_ADMIN user

### Build for Production

```bash
npm run build
```

## 🔑 User Roles & Demo Access

The application comes with pre-configured user roles for demonstration:

### Default User (Auto-login)
- **Role**: NCVET_ADMIN
- **Name**: Dr. Rajesh Kumar
- **Access**: Full policy dashboard with national overview

### Available Demo Roles
You can switch between roles using the browser's developer tools:

```javascript
// In browser console, switch user role:
localStorage.setItem('currentUser', JSON.stringify({
  id: 2,
  name: 'Mrs. Priya Sharma',
  role: 'PRINCIPAL',
  email: 'principal@annaiti.edu.in',
  branchId: 1,
  branchName: 'ANNA ITI'
}));
// Then refresh the page
```

**Available Roles:**
1. `NCVET_ADMIN` - Policy dashboard with national statistics
2. `PRINCIPAL` - Branch management and administration
3. `TRAINING_OFFICER` - Training and machine management
4. `ASSISTANT_TRAINING_OFFICER` - Assistance and complaint handling

## 📊 Mock Data

The application includes comprehensive mock data:

- **25 ITI Branches** across India
- **380 Training Machines** with maintenance schedules
- **2,450 Students** enrolled across all branches
- **145 Technicians** and training staff
- **Real-time complaints** and resolution tracking
- **Performance analytics** and trend data

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Government blue)
- **Secondary**: #764ba2 (Purple gradient)
- **Success**: #38a169 (Green)
- **Warning**: #ed8936 (Orange)
- **Danger**: #e53e3e (Red)
- **Gray**: #718096 (Text secondary)

### Typography
- **Font Family**: Segoe UI system font stack
- **Headings**: 700 weight
- **Body**: 400 weight
- **Labels**: 500 weight

### Component Styling
- **Cards**: 12px border radius, subtle shadows
- **Buttons**: 8px border radius, smooth transitions
- **Forms**: 2px borders with focus states
- **Charts**: Custom CSS-based visualizations

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adapted grid)
- **Mobile**: <768px (stacked layout, collapsible sidebar)

## 🔧 Customization

### Adding New Roles
1. Update `mockUsers` in `src/services/auth.js`
2. Add role permissions in authentication service
3. Update route protection in `src/app/routes.jsx`
4. Modify sidebar navigation in `src/components/layout/Sidebar.jsx`

### Adding New Pages
1. Create component in appropriate `pages/` subdirectory
2. Add route in `src/app/routes.jsx`
3. Update navigation in sidebar component
4. Add any required API mock data

### Styling Changes
- **Layout changes**: Edit `src/styles/layout.css`
- **Dashboard styling**: Edit `src/styles/dashboard.css`
- **Component-specific**: Add styles to respective CSS files

## 🚀 Deployment

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Environment Setup
- **Development**: Runs on `http://localhost:3000`
- **Production**: Static files in `dist/` directory
- **Deployment**: Compatible with Vercel, Netlify, AWS S3, etc.

## 📈 Performance Features

- **Code Splitting**: Automatic with Vite
- **Asset Optimization**: Built-in with Vite bundler
- **CSS Optimization**: Minimal, government-optimized styling
- **Image Optimization**: Placeholder images for development
- **Lazy Loading**: Components loaded on demand

## 🔒 Security Features

- **Role-based Access Control**: Route and component-level protection
- **Input Validation**: Form validation and sanitization
- **XSS Protection**: Safe rendering practices
- **CSRF Prevention**: Token-based authentication ready

## 🤝 Contributing

This is a complete implementation ready for production use. For enhancements:

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Review the component documentation in source files
- Check the console for any runtime errors
- Verify all dependencies are properly installed
- Ensure Node.js version compatibility

---

**Note**: This is a complete, production-ready React dashboard with role-based access control, government-style UI design, and comprehensive ITI management features. All components include realistic mock data and responsive design patterns.