import { useUser } from "@clerk/clerk-react";

export const useRole = () => {
  const { user } = useUser();
  return user?.publicMetadata?.role || null;
};
