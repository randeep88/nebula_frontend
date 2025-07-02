import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useUser = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const {
    data: user,
    isPending: isLoadingUser,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await axios.get(
        "https://nebula-music-player-3.onrender.com/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    retry: false,
  });

  // useEffect(() => {
  //   if (error?.response?.status === 401) {
  //     navigate("/login");
  //   }
  // }, [error, navigate]);

  const isAuthenticated = !!user && !isError;

  return { user, isLoadingUser, isAuthenticated };
};

export default useUser;
