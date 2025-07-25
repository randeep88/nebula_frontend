import SearchIcon from "@mui/icons-material/Search";
import { usePlayerStore } from "../store/usePlayerStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChevronUp, Pencil } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Button, Switch } from "@mui/material";
import useUser from "../hooks/useUser";
import userPic from "../assets/user.png";
import "../App.css";
import { SquarePen } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "motion/react";
import { backendAPI } from "../utils/backendAPI";
import { MuiOtpInput } from "mui-one-time-password-input";

const udpateUser = async (data) => {
  const token = localStorage.getItem("token");
  const res = await backendAPI.patch("/auth/user-update", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
const Header = () => {
  const {
    searchQuery,
    setSearchQuery,
    isBgOn,
    setIsBgOn,
    isOpen,
    setIsOpen,
    bgColor,
    setBgColor,
  } = usePlayerStore();

  const { register, handleSubmit, setValue, getValues } = useForm();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [otpMsg, setOTPMsg] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [isSubmiting, setSubmiting] = useState(false);
  const [isVerifying, setVerifying] = useState(false);

  console.log("otp", otp);
  console.log("otpMsg", otpMsg);

  const verifyOTP = async () => {
    setVerifying(true);
    const formData = getValues();
    const email = formData.email;
    const username = formData.username;
    const profilePic = formData.profilePic;

    const data = new FormData();
    data.append("email", email);
    data.append("username", username);
    data.append("profilePic", profilePic);

    console.log("verifyOTP", email);
    const res = await backendAPI.post("/auth/verify-otp", { otp, email });
    console.log(res.data.success);
    setVerifying(false);
    if (res.data.success) {
      udpateUserMutate(data);
      setOtp("");
      setOTPMsg("");
    }
  };

  const sendOtp = async ({ email }) => {
    try {
      setSubmiting(true);
      const res = await backendAPI.post("/auth/send-otp", { email });
      setOTPMsg(res.data.message);
      setSubmiting(false);
    } catch (err) {
      setSubmiting(false);
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
    }
  };

  const handleChange = (otp) => {
    setOtp(otp);
  };

  const [isAccOpen, setIsAccOpen] = useState(false);

  const { user, isAuthenticated, isLoadingUser } = useUser();

  const queryClient = useQueryClient();
  const [newProfile, setNewProfile] = useState(null);

  const { mutate: udpateUserMutate, isPending } = useMutation({
    mutationFn: udpateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
      toast.success("Changes saved!", {
        style: {
          background: "#14532d99",
          backdropFilter: "blur(5px)",
          padding: "10px",
          color: "#fff",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#FFFAEE",
        },
      });
    },
    onError: () => {
      toast.error("User already exists with this email", {
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

  const onSubmit = async (formData) => {
    if (user?.email === formData.email) {
      const data = new FormData();
      data.append("username", formData.username || user?.username);
      data.append("email", formData.email || user?.email);
      if (formData.newProfilePic)
        data.append("newProfilePic", formData.newProfilePic);

      try {
        udpateUserMutate(data);
      } catch (err) {
        console.error("Update failed:", err.response?.data || err.message);
      }
    } else {
      sendOtp({ email: formData.email });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast("You're logged out!", {
      style: {
        background: "#78350f99",
        backdropFilter: "blur(5px)",
        padding: "10px",
        color: "#fff",
        fontWeight: "600",
      },
      icon: "⚠️",
    });
  };

  const giveWarning = () => {
    toast("Enabling this effect may cause lag", {
      style: {
        background: "#78350f99",
        backdropFilter: "blur(5px)",
        padding: "10px",
        color: "#fff",
        fontWeight: "600",
      },
      icon: "⚠️",
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-between z-[99999] select-none">
      <div className="w-1/3 ps-10">
        <h1 className="text-3xl logoFont select-none font-extrabold text-[#00CDAC]">
          Nebula
        </h1>
      </div>
      <div className="w-1/3 flex items-center justify-center">
        <div className="relative ">
          <SearchIcon className="text-neutral-400 absolute z-10 top-3 left-4" />
          <input
            type="text"
            placeholder="What do you want to play?"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery || ""}
            className="rounded-full font-semibold p-3 ps-12 px-5 w-96 bg-neutral-800/60 ring-1 ring-neutral-700/60 backdrop-blur-lg placeholder-neutral-400 text-white focus:outline-none"
          />
        </div>
      </div>
      {isAuthenticated ? (
        <div className="relative flex items-center justify-end pe-10 gap-2 select-none w-1/3 z-[99999]">
          {user?.profilePic ? (
            <img
              src={user?.profilePic}
              className="w-10 h-10 rounded-full"
              alt=""
            />
          ) : (
            <img src={userPic} className="w-10" alt="user" />
          )}

          <button className="rounded-full p-0.5 hover:bg-neutral-800 transition-all">
            {!isOpen ? (
              <ChevronDown
                className="text-neutral-400"
                size={20}
                onClick={() => setIsOpen(true)}
              />
            ) : (
              <ChevronUp
                className="text-neutral-400"
                size={20}
                onClick={() => setIsOpen(false)}
              />
            )}
          </button>
        </div>
      ) : (
        <div className="relative flex items-center justify-end pe-10 gap-2 select-none w-1/3 z-[99999]">
          <Button
            onClick={() => navigate("/login")}
            variant="contained"
            sx={{
              fontFamily: "Mulish",
              fontWeight: "700",
              backgroundColor: "#00CDAC",
              borderRadius: "9999px",
              color: "#000",
              "&:hover": {
                backgroundColor: "#00CDACcc",
              },
            }}
          >
            Login
          </Button>
          <Button
            onClick={() => navigate("/register")}
            variant="outlined"
            sx={{
              fontFamily: "Mulish",
              fontWeight: "700",
              color: "#00CDAC",
              borderRadius: "9999px",
              borderColor: "#00CDAC",
              "&:hover": {
                borderColor: "#00CDAC",
                backgroundColor: "#00CDAC20",
              },
            }}
          >
            Signup
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "10%" }}
            animate={{ opacity: 1, x: "0%" }}
            exit={{ opacity: 0, x: "10%" }}
            transition={{
              duration: 0.1,
              x: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
            }}
            onClick={() => setIsOpen(false)}
            className="absolute top-0 right-0 h-screen w-full"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="transition-all shadow-lg absolute top-14 right-5 z-[99999] w-64 font-semibold rounded-lg text-neutral-200 py-2 bg-neutral-800/60 backdrop-blur-lg"
            >
              <div
                onClick={() => setIsAccOpen(true)}
                className="flex gap-3 items-center justify-center py-3 hover:bg-neutral-700/60 transition-all"
              >
                <div>
                  {user?.profilePic ? (
                    <img
                      src={user?.profilePic}
                      className="w-12 h-12 rounded-full"
                      alt=""
                    />
                  ) : (
                    <img src={userPic} className="w-12" alt="user" />
                  )}
                </div>
                <div>
                  <h1 className="line-clamp-1 truncate w-40">
                    {user?.username}
                  </h1>
                  <p className="text-xs text-neutral-400 line-clamp-1 truncate w-40">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="p-2 ps-5 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Liquid Chrome Background</p>
                  <Switch
                    size="small"
                    checked={isBgOn}
                    onChange={(e) => {
                      setIsBgOn(e.target.checked);
                      if (e.target.checked) {
                        giveWarning();
                      }
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#00CDAC",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#00CDAC",
                        },
                    }}
                  />
                </div>
                {isBgOn && (
                  <div className="flex items-center justify-center gap-5 my-3 transition-all">
                    <button
                      className={`${
                        bgColor === "red"
                          ? `bg-red-500 w-10 h-5 rounded-full ring-1 ring-neutral-100 transition-all`
                          : `bg-red-500 w-10 h-5 rounded-full`
                      }`}
                      onClick={() => setBgColor("red")}
                    ></button>
                    <button
                      className={`${
                        bgColor === "green"
                          ? `bg-green-500 w-10 h-5 rounded-full ring-1 ring-neutral-100 transition-all`
                          : `bg-green-500 w-10 h-5 rounded-full`
                      }`}
                      onClick={() => setBgColor("green")}
                    ></button>
                    <button
                      className={`${
                        bgColor === "blue"
                          ? `bg-blue-500 w-10 h-5 rounded-full ring-1 ring-neutral-100 transition-all`
                          : `bg-blue-500 w-10 h-5 rounded-full`
                      }`}
                      onClick={() => setBgColor("blue")}
                    ></button>
                    <button
                      className={`${
                        bgColor === "white"
                          ? `bg-gray-500 w-10 h-5 rounded-full ring-1 ring-neutral-100 transition-all`
                          : `bg-gray-500 w-10 h-5 rounded-full`
                      }`}
                      onClick={() => setBgColor("white")}
                    ></button>
                  </div>
                )}
              </div>
              <div
                onClick={() => setOpenLogoutModal(true)}
                className="p-2 px-5 hover:bg-red-900/30 transition-all bg-red-900/20 mt-2"
              >
                <p className="text-sm text-red-500">Logout</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {openLogoutModal && (
        <div
          onClick={() => {
            setOpenLogoutModal(false);
            setIsOpen(false);
          }}
          className="h-screen bg-black/10 backdrop-blur-md top-0 w-full text-white flex items-center justify-center p-10 absolute z-[999999]"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ filter: "blur(10px)", scale: 0.9 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{
              duration: 0.2,
              scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
            }}
            className="flex-col items-center justify-center p-8 bg-neutral-800 rounded-md pt-10"
          >
            <p className="text-lg font-semibold mb-1">
              Are you sure you want to logout?
            </p>
            <p className="text-md font-semibold text-neutral-400 mb-5">
              You’ll need to log in again to access your account
            </p>
            <div className="flex items-center justify-end gap-5 mb-5">
              <Button
                onClick={() => {
                  setOpenLogoutModal(false);
                  setIsOpen(false);
                }}
                variant="outlined"
                sx={{
                  fontFamily: "Mulish",
                  fontWeight: "700",
                  color: "white",
                  borderColor: "gray",
                  "&:hover": {
                    borderColor: "gray",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{
                  fontFamily: "Mulish",
                  fontWeight: "700",
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "red",
                  },
                }}
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {isAccOpen && (
        <div
          onClick={() => {
            setIsAccOpen(false);
            setIsOpen(false);
          }}
          className="h-screen bg-black/10 backdrop-blur-md top-0 w-full text-white flex items-center justify-center p-10 absolute z-[999999]"
        >
          <motion.div
            initial={{ filter: "blur(10px)", scale: 0.9 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{
              duration: 0.2,
              scale: { type: "spring", visualDuration: 0.3, bounce: 0.3 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="relative flex flex-col font-semibold items-center justify-center space-y-10 p-10 bg-neutral-800 rounded-lg shadow-lg"
            >
              <div className="relative rounded-full group flex flex-col items-center justify-center">
                <img
                  src={
                    newProfile
                      ? URL.createObjectURL(newProfile)
                      : user?.profilePic
                  }
                  className="w-44 h-44 object-cover rounded-full border-2 border-neutral-600"
                  alt="Profile"
                />
                <div className="transition-all group hover:bg-neutral-800 border-2 border-neutral-600 bg-neutral-700 w-8 h-8 rounded-full top-32 right-2 absolute flex items-center justify-center">
                  <label htmlFor="preview">
                    <Pencil
                      size={17}
                      color="#d4d4d4"
                      className="active:scale-95 transition-all"
                    />
                  </label>
                  <input
                    hidden
                    id="preview"
                    name="newProfilePic"
                    type="file"
                    accept="image/*"
                    {...register("newProfilePic")}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setNewProfile(file);
                      setValue("newProfilePic", file, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="username">Username</label>
                  <input
                    disabled={isLoadingUser || isPending}
                    className="w-64 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                    type="text"
                    id="username"
                    defaultValue={user?.username}
                    {...register("username")}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="email">Email</label>
                  <input
                    disabled={isLoadingUser || isPending}
                    className="w-64 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                    type="text"
                    id="email"
                    defaultValue={user?.email}
                    {...register("email")}
                  />
                </div>

                {otpMsg && (
                  <div className="flex items-center justify-center">
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
                  </div>
                )}

                {otpMsg && (
                  <p className="text-sm text-[#00CDAC] text-center">{otpMsg}</p>
                )}

                {otpMsg ? (
                  <Button
                    onClick={verifyOTP}
                    type="submit"
                    loading={isVerifying}
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
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmiting || isPending}
                    fullWidth
                    variant="contained"
                    loadingIndicator={
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    }
                    sx={{
                      fontFamily: "Mulish",
                      fontWeight: "700",
                      fontSize: "16px",
                      padding: "4px 10px",
                      textTransform: "none",
                      backgroundColor: "#00CDAC",
                      color: "black",
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
                    Save
                  </Button>
                )}
              </div>

              <div
                onClick={() => {
                  setIsAccOpen(false);
                  setIsOpen(false);
                }}
                className="absolute rounded-full -top-6 right-5"
              >
                <Button
                  variant="text"
                  sx={{
                    borderRadius: "100%",
                    width: "30px",
                    height: "30px",
                    textTransform: "none",
                    minWidth: "unset",
                    padding: "10px",
                    margin: 0,
                    color: "#a3a3a4",
                    backgroundColor: "rgba(55, 55, 55, 0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(66, 66, 66, 1)",
                      color: "white",
                    },
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Header;
