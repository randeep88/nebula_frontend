import axios from "axios";

export const backendAPI = axios.create({
  // baseURL: "https://nebula-music-player-3.onrender.com",
  // baseURL: "https://nebula-backend-wzrs.onrender.com",
  baseURL: "http://localhost:3000",
});
