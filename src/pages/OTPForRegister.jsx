import { useState, useEffect } from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import logo from "../assets/logo5.png";
import "../App.css";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";
import toast from "react-hot-toast";
import useUserData from "../store/useUserData";

const OTPRegisterPage = () => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { registerData } = useUserData();
  const email = registerData?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const verifyOTP = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    setVerifying(true);

    try {
      const res = await backendAPI.post("/auth/verify-otp", { otp, email });

      if (res.data.success) {
        toast.success(res.data.message, {
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
        navigate("/login");
      } else {
        toast.error(res.data.msg || "OTP verification failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Failed to verify OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);

    try {
      const res = await backendAPI.post("/auth/send-otp", { email });

      if (res.data.success) {
        toast.success("OTP resent successfully", {
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
        setOtp("");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleChange = (newOtp) => {
    setOtp(newOtp);
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center text-neutral-100">
      <div className="mb-10 flex-col flex items-center w-80">
        <img src={logo} className="w-20" alt="Nebula Logo" />
        <p className="text-xl font-bold mt-2">Verify your Email address</p>
        <p className="text-sm text-neutral-300 mt-1 text-center">
          We've sent a 4-digit code to {email}. Please enter the code below to
          complete your registration. OTP will expire in 5 minutes.
        </p>
      </div>

      <MuiOtpInput
        value={otp}
        onChange={handleChange}
        length={4}
        className="w-80"
        TextFieldsProps={{
          sx: {
            input: {
              color: "#ffffff",
              backgroundColor: "#1f1f1f",
              borderRadius: "8px",
              padding: "12px",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#999",
              },
              "&:hover fieldset": {
                borderColor: "#ccc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00CDAC",
              },
            },
          },
        }}
      />

      <div className="w-80 mt-10 space-y-4">
        <Button
          onClick={verifyOTP}
          type="submit"
          disabled={verifying || otp.length !== 4}
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
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <div className="text-center">
          <p className="text-neutral-300 text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={resendOTP}
              disabled={resending}
              className="underline text-neutral-100 font-semibold hover:text-white disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/register"
            className="text-neutral-400 text-sm underline hover:text-neutral-100"
          >
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OTPRegisterPage;
