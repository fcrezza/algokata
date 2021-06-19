import axios from "axios";

// const baseUrl = "http://localhost:8080";

export default axios.create({
  withCredentials: true
});
