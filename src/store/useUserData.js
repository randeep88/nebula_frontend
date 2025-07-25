import { create } from "zustand";

const useUserData = create((set) => ({
  email: "",
  setEmail: (email) => set({ email }),

  username: "",
  setUsername: (username) => set({ username }),

  profilePic: "",
  setProfilePic: (profilePic) => set({ profilePic }),

  registerData: {},
  setRegisterData: ({ email, username, profilePic }) =>
    set({ registerData: { email, username, profilePic } }),
}));

export default useUserData;
