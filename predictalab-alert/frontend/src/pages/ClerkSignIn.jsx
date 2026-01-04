import { SignIn, useClerk } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export default function ClerkSignIn() {
  const { user } = useClerk();
  const [params] = useSearchParams();
  const selectedRole = params.get("role");  // from RoleSelectPage

  useEffect(() => {
    if (user && selectedRole) {
      // Store role in localStorage as backup
      localStorage.setItem("selectedRole", selectedRole);
      
      // Update Clerk metadata
      user.update({
        publicMetadata: { role: selectedRole }
      });
    }
  }, [user, selectedRole]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        fallbackRedirectUrl="/role-redirect"
      />
    </div>
  );
}
