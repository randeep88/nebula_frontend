import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo5.png";
import { useLogin } from "../hooks/useLogin";
import "../App.css";
import { Button } from "@mui/material";
import { backendAPI } from "../utils/backendAPI";

const sendOtp = async (email, purpose) => {
  await backendAPI.post("/auth/send-otp", { email, purpose });
  localStorage.setItem("emailForOTP", email);
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const { loginMutate, isPending } = useLogin();

  const onSubmit = (data) => {
    sendOtp(data.email, "login");
    navigate("/otp");
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex items-center justify-center text-neutral-100">
      <div className="py-20 px-20 rounded-xl">
        <div className="flex flex-col items-center justify-center w-full mb-10">
          <img src={logo} className="w-20" alt="" />
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
              disabled={isPending}
              id="email"
              type="email" 
              name="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
              className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
            />
          </div>
          {errors && (
            <span className="text-red-500">{errors?.email?.message}</span>
          )}
          {/* <div>
            <label htmlFor="password" className="block text-sm font-bold mb-1">
              Password
            </label>
            <input
              disabled={isPending}
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
            />
          </div>
          {errors && (
            <span className="text-red-500">{errors?.password?.message}</span>
          )} */}
          <Button
            type="submit"
            loading={isPending}
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
            Send OTP
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
