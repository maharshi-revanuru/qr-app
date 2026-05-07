import axios from "axios";

const API = axios.create({
  baseURL: "https://manapanchayat.com/api",
});

export default API;