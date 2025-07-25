import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";

const useUser = () => {
  const token = localStorage.getItem("token");

  const {
    data: user,
    isPending: isLoadingUser,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await backendAPI.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    retry: false,
  });

  const isAuthenticated = !!user && !isError;

  return { user, isLoadingUser, isAuthenticated };
};

export default useUser;
