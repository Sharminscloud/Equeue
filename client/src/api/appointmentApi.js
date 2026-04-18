import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/appointments`,
});

export const createAppointment = async (payload) => {
  const response = await API.post("/", payload);
  return response.data;
};