import axios from "axios";

export const backendAPI = axios.create({
  baseURL: "https://nebula-music-player-3.onrender.com",
});
