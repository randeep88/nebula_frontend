import axios from "axios";

export const backendAPI = axios.create({
  baseURL: "https://nebula-backend-wzrs.onrender.com",
  // baseURL: "http://localhost:3000",
});
