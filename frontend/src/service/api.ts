// import axios from "axios";

// // Create Axios instance

// const api = axios.create({
//   baseURL: "http://localhost:5000",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor to attach JWT token automatically

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // JWT stored after login
//     if (token && config.headers) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;
