import { Button } from "@mui/material";
import logo from "../assets/logo5.png";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { MdOutlineCloudUpload } from "react-icons/md";
import { useRegister } from "../hooks/useRegister";
import { useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const { registerMutate, isPending } = useRegister();
  const profilePicFile = watch("profilePic");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData) => {
    try {
      let file = formData.profilePic?.[0];

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

      registerMutate(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Registration failed";
      toast.error(errorMessage);
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex items-center justify-center text-neutral-100">
      <div className="h-full overflow-auto w-full flex flex-col items-center justify-center scrollbar scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div className="flex flex-col items-center justify-center w-full mb-10">
          <img src={logo} className="w-20" alt="Nebula Logo" />
          <h2 className="text-4xl logoFont text-center select-none font-extrabold text-white">
            Signup to Nebula
          </h2>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-10 items-start"
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
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  maxLength: {
                    value: 20,
                    message: "Username must be less than 20 characters",
                  },
                })}
              />
              {errors.username && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.username.message}
                </span>
              )}
            </div>

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
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label
                htmlFor="profilePic"
                className="text-sm font-semibold text-white"
              >
                Profile Picture (Optional)
              </label>

              {imagePreview ? (
                <div className="relative w-80 h-40 bg-neutral-800/60 rounded-lg border-2 border-neutral-600 overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label
                      htmlFor="profilePic"
                      className="cursor-pointer bg-[#00CDAC] text-black px-4 py-2 rounded-lg font-semibold"
                    >
                      Change Image
                    </label>
                  </div>
                  <input
                    disabled={isPending}
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("profilePic")}
                    onChange={(e) => {
                      register("profilePic").onChange(e);
                      handleImageChange(e);
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-80 h-40 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 rounded-lg border-dashed border-2 border-neutral-600 hover:border-[#00CDAC] transition-all flex items-center justify-center cursor-pointer overflow-hidden">
                  <div className="flex flex-col items-center justify-center z-10">
                    <MdOutlineCloudUpload className="text-4xl mb-2" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Max size: 5MB
                    </p>
                  </div>

                  <input
                    disabled={isPending}
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    {...register("profilePic")}
                    onChange={(e) => {
                      register("profilePic").onChange(e);
                      handleImageChange(e);
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-neutral-400">
                If no image is uploaded, a random avatar will be generated
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending}
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
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing up...
                </span>
              ) : (
                "Signup"
              )}
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
