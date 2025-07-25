import { useState, useEffect } from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import logo from "../assets/logo5.png";
import "../App.css";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { backendAPI } from "../utils/backendAPI";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

const OTPPage = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { loginMutate, isPending } = useLogin();
  const email = localStorage.getItem("emailForOTP");

  useEffect(() => {
    if (!email) navigate("/login");
  }, []);

  const verifyOTP = async () => {
    const res = await backendAPI.post("/auth/verify-otp", { otp, email });
    if (res.data.success) {
      loginMutate({ email });
    }
  };

  const handleChange = (otp) => {
    setOtp(otp);
  };

  if (isPending) return <p>Loading...</p>;

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center text-neutral-100">
      <div className="mb-10 flex-col flex items-center  w-80">
        <img src={logo} className="w-20" />
        <p className="text-xl font-bold mt-2">Verify your Email address</p>
        <p className="text-sm text-neutral-300 mt-1 text-center">
          We’ve sent a 4-digit code to {email}, Please enter the code below to
          continue. OTP will expire in 5 minutes.
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

      <div className="w-80 mt-10">
        <Button
          onClick={verifyOTP}
          type="submit"
          // loading={isPending}
          fullWidth
          variant="contained"
          loadingIndicator={
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          }
          sx={{
            fontFamily: "Mulish",
            fontSize: "16px",
            padding: "4px 10px",
            textTransform: "none",
            backgroundColor: "#00CDAC",
            color: "black",
            fontWeight: "700",
            "&.MuiLoadingButton-root": {
              backgroundColor: "#00CDAC",
            },
            "&.Mui-disabled": {
              backgroundColor: "#00CDAC",
              opacity: 1,
            },
            "&:hover": {
              backgroundColor: "#00CDACcc",
            },
          }}
        >
          Verify OTP
        </Button>
      </div>
      <div>
        <p className="text-neutral-300 mt-5 text-center">
          Didn't receive the code?{" "}
          <Link className="underline text-neutral-100" to="/send-otp">
            Resend OTP
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OTPPage;
