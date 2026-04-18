import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/notifications`,
});

export const fetchNotifications = async (page = 1, limit = 10) => {
  const response = await API.get(`/?page=${page}&limit=${limit}`);
  return response.data;
};