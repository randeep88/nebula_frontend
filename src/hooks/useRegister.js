import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";
import { toast } from "react-hot-toast";
import useUserData from "../store/useUserData";

// https://nebula-music-player-3.onrender.com

export const useRegister = () => {
  const navigate = useNavigate();
  const { setRegisterData } = useUserData();

  const { mutate: registerMutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const email = data.get("email");
      const username = data.get("username");
      const profilePic = data.get("profilePic");

      setRegisterData({ email, username, profilePic });

      await backendAPI.post("/auth/send-otp", data);
    },

    onSuccess: () => {
      navigate("/otp-register");
    },
    onError: (err) => {
      toast.error(err.response.data.msg, {
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

  return { registerMutate, isPending };
};
