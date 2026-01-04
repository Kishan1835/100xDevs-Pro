// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Public Pages
import LandingPage from "../pages/LandingPage";
import RoleSelectPage from "../pages/RoleSelectPage";
import ClerkSignIn from "../pages/ClerkSignIn";
import ClerkSSOCallback from "../pages/ClerkSSOCallback";
import RoleRedirect from "./RoleRedirect";
import Unauthorized from "../pages/Unauthorized";

// Layout
import { Sidebar } from "../components/Sidebar";
import AtoSidebar from "../components/AtoSidebar";
import ToSidebar from "../components/ToSidebar";
import MaintenanceSidebar from "../components/MaintenanceSidebar";
import PrincipalSidebar from "../components/PrincipalSidebar";
import { Header } from "../components/Header";
import watermarkLogo from "../assets/ncvlogo.png";

// NCVET Dashboard Pages
import Home from "../dashboard/NCVET/Home";
import MapPage from "../dashboard/NCVET/MapPage";
import BranchesPage from "../dashboard/NCVET/BranchesPage";
import BranchDetailsPage from "../dashboard/NCVET/BranchDetailsPage";
import ComplaintsPage from "../dashboard/NCVET/ComplaintsPage";
import ReportsPage from "../dashboard/NCVET/ReportsPage";
import NCVETAuction from "../dashboard/NCVET/NCVETauction";


// ATO Dashboard
import AtoHome from "../dashboard/ATO/AtoDashboard";
import AtoLogbookPage from "../dashboard/ATO/AtoLogbookPage";
import ATOSchedulingPage from "../dashboard/ATO/ATOSchedulingPage";
import AttendancePage from "../dashboard/ATO/AttendancePage";
import TaskPage from "../dashboard/ATO/TaskPage";
import AtoMaintenance from "../dashboard/ATO/AtoMaintenance";

import AtoNotifications from "../dashboard/ATO/AtoNotifications";

// TO Dashboard
import ToDashboard from "../dashboard/TO/ToDashboard";
import TOLogbookPage from "../dashboard/TO/TOLogbookPage";
import AttendanceMonitoring from "../dashboard/TO/AttendanceMonitoring";
import MachineMonitoring from "../dashboard/TO/MachineMonitoring";
import SchedulingPage from "../dashboard/TO/TOSchedulingPage";
import TOAuctionPage from "../dashboard/TO/AuctionPage";
import TasksPage from "../dashboard/TO/TasksPage";
import TOReports from "../dashboard/TO/TOReports";
import TOMaintenancePage from "../dashboard/TO/TOMaintenancePage";
import TONotificationsPage from "../dashboard/TO/NotificationsPage";

// NEW ROLE: MAINTENANCE
// Replace this import if your file location differs
import MaintenanceDashboard from "../dashboard/Maintenance/MaintenanceDashboard";
import Machines from "../dashboard/Maintenance/Machines";
import MachineDetails from "../dashboard/Maintenance/MachineDetails";

// Principal Dashboard
import PrincipalDashboard from "../dashboard/Principal/PrincipalDashboard";
import PrincipalAuction from "../dashboard/Principal/principalauction";

// ⭐ Dashboard Layout Wrapper
const DashboardLayout = ({ children, role }) => {
  const getSidebar = () => {
    if (role === "ASSISTANT_TRAINING_OFFICER") return <AtoSidebar />;
    if (role === "TRAINING_OFFICER") return <ToSidebar />;
    if (role === "MAINTENANCE") return <MaintenanceSidebar />;
    if (role === "LAB_PRINCIPAL") return <PrincipalSidebar />;

    return <Sidebar />;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#f5f7fa]">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {getSidebar()}

        {/* Watermark */}
        <div className="fixed top-[55%] left-[57%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 z-0">
          <img src={watermarkLogo} alt="Watermark" className="w-[600px] h-auto" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">{children}</div>
      </div>
    </div>
  );
};

// ⭐ All route definitions
const routeConfig = {
  public: [
    { path: "/", element: <LandingPage /> },
    { path: "/select-role", element: <RoleSelectPage /> },
    { path: "/sign-in", element: <ClerkSignIn /> },
    { path: "/sign-in/sso-callback", element: <ClerkSSOCallback /> },
    { path: "/role-redirect", element: <RoleRedirect /> },
    { path: "/unauthorized", element: <Unauthorized /> },
  ],

  redirects: [
    { from: "/ncv/dashboard", to: "/ncv/dashboard/home" },
    { from: "/ato/dashboard", to: "/ato/dashboard/home" },
    { from: "/to/dashboard", to: "/to/dashboard/home" },
    { from: "/maintenance/dashboard", to: "/maintenance/dashboard/home" }, // NEW
    { from: "/principal/dashboard", to: "/principal/dashboard/home" },
  ],

  protected: {
    POLICY_MAKER: [
      { path: "/ncv/dashboard/home", component: Home },
      { path: "/ncv/dashboard/map", component: MapPage },
      { path: "/ncv/dashboard/branches", component: BranchesPage },
      { path: "/ncv/dashboard/branches/:itiId", component: BranchDetailsPage },
      { path: "/ncv/dashboard/branches/:itiId/report", component: ReportsPage },
      { path: "/ncv/dashboard/complaints", component: ComplaintsPage },
      { path: "/ncv/dashboard/auction", component: NCVETAuction },
      { path: "/ncv/dashboard/reports", component: ReportsPage },
    ],

    ASSISTANT_TRAINING_OFFICER: [
      { path: "/ato/dashboard/home", component: AtoHome },
      { path: "/ato/dashboard/logbook", component: AtoLogbookPage },
      { path: "/ato/dashboard/attendance", component: AttendancePage },
      { path: "/ato/dashboard/tasks", component: TaskPage },
      { path: "/ato/dashboard/maintenance", component: AtoMaintenance },
      { path: "/ato/dashboard/scheduling", component: ATOSchedulingPage },
      { path: "/ato/dashboard/notifications", component: AtoNotifications },
    ],

    TRAINING_OFFICER: [
      { path: "/to/dashboard/home", component: ToDashboard },
      { path: "/to/logbook", component: TOLogbookPage },
      { path: "/to/attendance", component: AttendanceMonitoring },
      { path: "/to/machine-monitoring", component: MachineMonitoring },
      { path: "/to/scheduling", component: SchedulingPage },
      { path: "/to/auctions", component: TOAuctionPage },
      { path: "/to/tasks", component: TasksPage },
      { path: "/to/reports", component: TOReports },
      { path: "/to/maintenance", component: TOMaintenancePage },
      { path: "/to/notifications", component: TONotificationsPage },
    ],

    // ⭐ NEW ROLE: MAINTENANCE
    MAINTENANCE: [
      { path: "/maintenance/dashboard/home", component: MaintenanceDashboard },
      { path: "/maintenance/machines", component: Machines },
      { path: "/maintenance/machines/:machineId", component: MachineDetails },
      // Add more pages if needed:
      // { path: "/maintenance/work-orders", component: WorkOrdersPage },
      // { path: "/maintenance/preventive", component: PreventiveMaintenancePage },
    ],

    // ⭐ PRINCIPAL ROLE
    LAB_PRINCIPAL: [
      { path: "/principal/dashboard/home", component: PrincipalDashboard },
      { path: "/principal/dashboard/auctions", component: PrincipalAuction },
      // Add more pages as needed:
      // { path: "/principal/dashboard/staff", component: StaffPage },
      // { path: "/principal/dashboard/approvals", component: ApprovalsPage },
    ],
  },
};

// Mount all routes
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      {routeConfig.public.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Redirects */}
      {routeConfig.redirects.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* Protected by role */}
      {Object.entries(routeConfig.protected).map(([role, routes]) =>
        routes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={[role]}>
                <DashboardLayout role={role}>
                  <Component />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        ))
      )}
    </Routes>
  );
}