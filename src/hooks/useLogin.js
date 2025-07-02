import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";

export const useLogin = () => {
  const navigate = useNavigate();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(
        "https://nebula-music-player-3.onrender.com/auth/login",
        data
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      console.log(token);
    },
    onSuccess: () => {
      navigate("/");
      toast.success("You're in! Let's go 🎧", {
        style: {
          border: "1px solid #00CDAC99",
          background: "#333333",
          padding: "10px",
          color: "#00CDAC",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#00CDAC",
          secondary: "#FFFAEE",
        },
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error("Login credentials are incorrect", {
        style: {
          border: "1px solid #FF000099",
          background: "#333333",
          padding: "10px",
          color: "#FF0000",
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
