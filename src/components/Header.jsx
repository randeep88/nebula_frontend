import SearchIcon from "@mui/icons-material/Search";
import { usePlayerStore } from "../store/usePlayerStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Button, Switch } from "@mui/material";
import useUser from "../hooks/useUser";
import userPic from "../assets/user.png";
import "../App.css";
import { SquarePen } from "lucide-react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const udpateUser = async (data) => {
  const token = localStorage.getItem("token");
  const res = await axios.patch(
    "https://nebula-music-player-3.onrender.com/auth/user-update",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
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
  const navigate = useNavigate();

  const [isAccOpen, setIsAccOpen] = useState(false);

  const { user, isAuthenticated, isLoadingUser } = useUser();
  console.log(user, isAuthenticated);

  const queryClient = useQueryClient();
  const [newProfile, setNewProfile] = useState(null);

  const { register, handleSubmit, setValue } = useForm();

  const { mutate: udpateUserMutate, isPending } = useMutation({
    mutationFn: udpateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
      toast.success("Changes saved!", {
        style: {
          border: "1px solid #00CDAC99",
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
    onError: () => {
      toast.error("Error occurred. Check your inputs", {
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
    const data = new FormData();
    data.append("username", formData.username || user?.username);
    data.append("email", formData.email || user?.email);
    if (formData.currentPassword)
      data.append("currentPassword", formData.currentPassword);
    if (formData.newPassword) data.append("newPassword", formData.newPassword);
    if (formData.newProfilePic)
      data.append("newProfilePic", formData.newProfilePic);

    try {
      for (let pair of data.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
      udpateUserMutate(data);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error("Update failed: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast("You're logged out!", {
      style: {
        border: "1px solid #FFB45699",
        background: "#333333",
        padding: "10px",
        color: "#FFB456",
        fontWeight: "600",
      },
      icon: "⚠️",
    });
  };

  const giveWarning = () => {
    toast("Enabling this effect may cause lag", {
      style: {
        border: "1px solid #FFB45699",
        background: "#333333",
        padding: "10px",
        color: "#FFB456",
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
              backgroundColor: "#00CDAC",
              borderRadius: "20px",
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
              color: "#00CDAC",
              borderRadius: "20px",
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

      {isOpen && (
        <div
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
                <h1 className="line-clamp-1 truncate w-40">{user?.username}</h1>
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
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
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
              onClick={handleLogout}
              className="p-2 px-5 hover:bg-red-900/30 transition-all bg-red-900/20 mt-2"
            >
              <p className="text-sm text-red-500">Logout</p>
            </div>
          </div>
        </div>
      )}

      {isAccOpen && (
        <div
          onClick={() => setIsAccOpen(false)}
          className="h-screen bg-black/50 backdrop-blur-md top-0 w-full text-white flex items-center justify-center p-10 absolute z-[999999]"
        >
          <form
            onClick={(e) => e.stopPropagation()}
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
                className="w-40 h-40 object-cover rounded-full"
                alt="Profile"
              />
              <div className=" group-hover:opacity-100 bg-black/50 group transition-all rounded-full opacity-0 top-0 absolute w-40 h-40 flex items-center justify-center">
                <label htmlFor="preview">
                  <SquarePen className="group-hover:opacity-100" />
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
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="currentPassword">Current password</label>
                <input
                  disabled={isLoadingUser || isPending}
                  className="w-64 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                  type="password"
                  id="currentPassword"
                  {...register("currentPassword")}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="newPassword">New password</label>
                <input
                  disabled={isLoadingUser || isPending}
                  className="w-64 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                  type="password"
                  id="newPassword"
                  {...register("newPassword")}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  disabled={isLoadingUser || isPending}
                  className="w-64 border-2 focus:border-white transition-all p-2 rounded text-neutral-100 focus:outline-none font-semibold bg-transparent border-neutral-600"
                  type="password"
                  id="confirmPassword"
                />
              </div>
              <span className="text-neutral-400 text-sm text-center">
                Always provide current password to proceed
              </span>
              <Button
                type="submit"
                loading={isLoadingUser || isPending}
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
                Save
              </Button>
            </div>

            <div
              onClick={() => setIsAccOpen(false)}
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
        </div>
      )}
    </div>
  );
};

export default Header;
