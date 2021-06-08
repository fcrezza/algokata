import axios from "axios";

const baseUrl = "http://localhost:8080";

export default axios.create({
  baseURL: baseUrl,
  withCredentials: true
});
