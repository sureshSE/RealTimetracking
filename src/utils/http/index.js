import axios from 'axios'
import config from "../config"

const BASE_URL = "https://uat-tracking.rmtec.in/"

const token = localStorage.getItem("token")

const httpService = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  headers: {
    Authorization: 'Bearer ' + token,
    ContentType: 'application/json',
  },
})

// Add a request interceptor
httpService.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
)

export default httpService
