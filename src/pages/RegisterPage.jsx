import { Button } from "@mui/material";
import logo from "../assets/logo5.png";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { MdOutlineCloudUpload } from "react-icons/md";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { registerMutate, isPending } = useRegister();

  const onSubmit = async (formData) => {
    try {
      let file = formData.profilePic[0];
      console.log("onsubmit", file);

      if (!file) {
        const seed = Date.now() + Math.random();
        const randomUrl = `https://robohash.org/${seed}?set=set1`;

        const response = await fetch(randomUrl);
        const blob = await response.blob();
        file = new File([blob], `avatar-${seed}.png`, {
          type: blob.type,
        });
      }
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("profilePic", file);

      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }
      console.log(data instanceof FormData);
      registerMutate(data);
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };

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

            <div className="flex flex-col space-y-2">
              <label
                htmlFor="profilePic"
                className="text-sm font-semibold text-white"
              >
                Profile Picture
              </label>

              <div className="relative w-80 h-20 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 rounded-lg border-dashed border-2 border-neutral-600 hover:border-[#00CDAC] transition-all flex items-center justify-center cursor-pointer overflow-hidden">
                <div className="flex flex-col items-center justify-center z-10">
                  <MdOutlineCloudUpload className="text-3xl mb-2" />
                  <p className="text-sm font-medium">Click to upload image</p>
                </div>

                <input
                  disabled={isPending}
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  // onChange={handleImageChange}
                  {...register("profilePic")}
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
