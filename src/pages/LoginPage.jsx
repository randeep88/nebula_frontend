import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo5.png";
import { useLogin } from "../hooks/useLogin";
import "../App.css";
import { Button } from "@mui/material";
import { backendAPI } from "../utils/backendAPI";
import { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [sendingOTP, setSendingOTP] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { isPending } = useLogin();

  const onSubmit = async (data) => {
    setSendingOTP(true);

    try {
      const res = await backendAPI.post("/auth/send-otp", {
        email: data.email,
        purpose: "login",
      });

      if (res.data.success) {
        localStorage.setItem("emailForOTP", data.email);
        navigate("/otp");
      } else {
        toast.error(res.data.message || "Failed to send OTP", {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
        });
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.msg ||
          "Failed to send OTP. Please try again.";
        toast.error(errorMessage, {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
        });
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.", {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
        });
      } else {
        toast.error("Failed to send OTP. Please try again.", {
          style: {
            background: "#7f1d1d99",
            backdropFilter: "blur(5px)",
            padding: "10px",
            color: "#fff",
            fontWeight: "600",
          },
        });
      }
      console.error("Error sending OTP:", error);
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex items-center justify-center text-neutral-100">
      <div className="py-20 px-20 rounded-xl">
        <div className="flex flex-col items-center justify-center w-full mb-10">
          <img src={logo} className="w-20" alt="Nebula Logo" />
          <h2 className="text-4xl logoFont text-center select-none font-extrabold text-white">
            Login to <br /> start listening
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-1">
              Email
            </label>
            <input
              disabled={isPending || sendingOTP}
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
            />
            {errors.email && (
              <span className="text-red-500 text-sm block mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || sendingOTP}
            fullWidth
            variant="contained"
            sx={{
              fontFamily: "Mulish",
              fontSize: "16px",
              padding: "8px 10px",
              textTransform: "none",
              backgroundColor: "#00CDAC",
              color: "black",
              fontWeight: "700",
              "&.Mui-disabled": {
                backgroundColor: "#00CDAC",
                opacity: 0.6,
              },
              "&:hover": {
                backgroundColor: "#00CDACcc",
              },
            }}
          >
            {sendingOTP ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>

        <p className="text-neutral-400 font-semibold text-center mt-10">
          Don't have an account?{" "}
          <Link className="underline text-neutral-100" to="/register">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
