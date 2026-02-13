import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";
import { toast } from "react-hot-toast";
import useUserData from "../store/useUserData";

export const useRegister = () => {
  const navigate = useNavigate();
  const { setRegisterData } = useUserData();

  const { mutate: registerMutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await backendAPI.post("/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },

    onSuccess: async (responseData, formData) => {
      const email = formData.get("email");
      const username = formData.get("username");
      const profilePic = formData.get("profilePic");

      setRegisterData({ email, username, profilePic });

      try {
        await backendAPI.post("/auth/send-otp", { email });

        toast.success("Registration successful! Please verify your email.", {
          style: {
            background: "#065f4699",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
          iconTheme: {
            primary: "#00CDAC",
            secondary: "#FFFAEE",
          },
        });

        navigate("/otp-register");
      } catch (otpError) {
        toast.error(
          "Registration successful but failed to send OTP. Please login to resend.",
          {
            style: {
              background: "#7f1d1d99",
              backdropFilter: "blur(5px)",
              padding: "10px",
              color: "#fff",
              fontWeight: "600",
            },
          },
        );
        navigate("/login");
      }
    },

    onError: (err) => {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      toast.error(errorMessage, {
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
