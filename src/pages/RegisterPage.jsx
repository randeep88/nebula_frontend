import { Button } from "@mui/material";
import axios from "axios";
import logo from "../assets/logo5.png";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineCloudUpload } from "react-icons/md";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm();
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const { mutate: createUserMutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        "https://nebula-music-player-3.onrender.com/auth/register",
        data
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
    },
    onSuccess: () => {
      navigate("/");
      toast.success("Glad to have you here 🎉", {
        style: {
          border: "1px solid #00CDAC",
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
      console.log(err.response.data.msg);
      toast.error(err.response.data.msg, {
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

  const onSubmit = async (formData) => {
    try {
      let file = getValues("profilePic");

      if (!file) {
        const seed = Date.now() + Math.random();
        const randomUrl = `https://robohash.org/${seed}?set=set1`;

        const response = await fetch(randomUrl);
        const blob = await response.blob();
        file = new File([blob], `avatar-${seed}.png`, {
          type: blob.type,
        });
      }

      if (formData.password !== formData.confirmPassword) {
        setError("confirmPassword", { message: "Passwords do not match" });
        return;
      }

      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("profilePic", file);

      createUserMutate(data);
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setValue("profilePic", file);

    if (file) {
      setPreview(URL.createObjectURL(file));
      setError("profilePic", null);
    }
  };

  console.log(errors);

  return (
    <div className="h-screen w-full bg-neutral-900 flex items-center justify-center text-neutral-100">
      <div className="h-full overflow-auto w-full flex flex-col items-center justify-center scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="flex flex-col items-center justify-center w-full mb-10">
          <img src={logo} className="w-20" alt="" />
          <h2 className="text-4xl logoFont text-center select-none font-extrabold text-white">
            Signup to Nebula
          </h2>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" flex gap-10 items-start"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold mb-1"
              >
                Username
              </label>
              <input
                disabled={isPending}
                placeholder="Username"
                className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                id="username"
                type="text"
                {...register("username", { required: "Username is required" })}
              />
            </div>
            {errors && (
              <span className="text-red-500">{errors?.username?.message}</span>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-1">
                Email
              </label>
              <input
                disabled={isPending}
                placeholder="Email"
                className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors && (
              <span className="text-red-500">{errors?.email?.message}</span>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-1"
              >
                Password
              </label>
              <input
                disabled={isPending}
                placeholder="Password"
                className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors && (
              <span className="text-red-500">{errors?.password?.message}</span>
            )}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold mb-1"
              >
                Confirm Password
              </label>
              <input
                disabled={isPending}
                placeholder="Confirm Password"
                className="w-80 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Password confirmation is required",
                })}
              />
            </div>
            {errors && (
              <span className="text-red-500">
                {errors?.confirmPassword?.message}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="profilePic"
                className="text-sm font-semibold text-white"
              >
                Profile Picture
              </label>

              <div className="relative w-80 h-60 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 rounded-lg border-dashed border-2 border-neutral-600 hover:border-[#00CDAC] transition-all flex items-center justify-center cursor-pointer overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center z-10">
                    <MdOutlineCloudUpload className="text-3xl mb-2" />
                    <p className="text-sm font-medium">Click to upload image</p>
                  </div>
                )}

                <input
                  disabled={isPending}
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={isPending}
              fullWidth
              variant="contained"
              loadingIndicator={
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              }
              sx={{
                fontSize: "16px",
                padding: "4px 10px",
                textTransform: "none",
                backgroundColor: "#00CDAC",
                color: "black",
                fontWeight: "600",
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
              Signup
            </Button>

            <p className="text-neutral-400 font-semibold text-center mt-10">
              Already have an account?{" "}
              <Link className="underline text-neutral-100" to="/login">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
