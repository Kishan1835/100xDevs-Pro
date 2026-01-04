import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function RoleRedirect() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;   // Wait for Clerk
    if (!isSignedIn) {
      navigate("/select-role"); 
      return;
    }

    // Try to get role from Clerk metadata, fallback to localStorage
    let role = user?.publicMetadata?.role;
    
    if (!role) {
      role = localStorage.getItem("selectedRole");
    }

    if (!role) {
      navigate("/unauthorized");
      return;
    }

    // Ensure role is uppercase for consistent routing
    const normalizedRole = role.toUpperCase();

    // 🔥 Safe Role-Based Redirects
    const routes = {
      POLICY_MAKER: "/ncv/dashboard/home",
      ASSISTANT_TRAINING_OFFICER: "/ato/dashboard/home",
      LAB_PRINCIPAL: "/principal/dashboard/home",
      TRAINING_OFFICER: "/to/dashboard/home",
      MAINTENANCE: "/maintenance/dashboard/home",
    };

    navigate(routes[normalizedRole] || "/unauthorized");

  }, [isLoaded, isSignedIn, user, navigate]);

  return null;
}
