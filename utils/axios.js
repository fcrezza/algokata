import axios from "axios";

const custom = axios.create({
  withCredentials: true
});

export default custom;
