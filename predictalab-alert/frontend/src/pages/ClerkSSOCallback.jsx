import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ClerkSSOCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const url = params.get("after_sign_in_url") || "/role-redirect";
    navigate(url, { replace: true });
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center text-gray-600">
      Redirecting...
    </div>
  );
}
