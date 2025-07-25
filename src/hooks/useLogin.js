import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";
import { toast } from "react-hot-toast";

// https://nebula-music-player-3.onrender.com

export const useLogin = () => {
  const navigate = useNavigate();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async ({ email }) => {
      const response = await backendAPI.post("/auth/login", { email });
      const { token } = response.data;
      localStorage.setItem("token", token);
    },
    onSuccess: () => {
      navigate("/");
      toast.success("You're in! Let's go 🎧", {
        style: {
          background: "#14532d99",
          backdropFilter: "blur(5px)",
          padding: "10px",
          color: "#fff",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#FFFAEE",
        },
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error("Login credentials are incorrect", {
        style: {
          background: "#7f1d1d99",
          backdropFilter: "blur(5px)",
          padding: "10px",
          color: "#fff",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#FF0000",
          secondary: "#FFFAEE",
        },
      });
    },
  });

  return { loginMutate, isPending };
};
