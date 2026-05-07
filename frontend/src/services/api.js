import axios from "axios";

const API = axios.create({
  baseURL: "https://mana-panchayat.onrender.com/api",
});

export default API;