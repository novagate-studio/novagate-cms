import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { cookiesInstance } from './cookies'
// Create a custom axios instance
const adminAxiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL,
  // Enable cookies to be sent with requests
  withCredentials: true,
})

// Request interceptor to attach the token to each request
adminAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from cookie
    const token = cookiesInstance.get('access_token')

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error)
  }
)

// Response interceptor (optional)
adminAxiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response
  },
  async (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status == 401) {
        // Check if we've already tried to retry this request
        if (error.config._retry) {
          // We've already retried once, don't retry again
          sessionStorage.removeItem('access_token')
          localStorage.removeItem('access_token')
          return Promise.reject(error)
        }
      }
    }

    return Promise.reject(error)
  }
)
// Create a custom axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // Enable cookies to be sent with requests
  withCredentials: true,
})

// Request interceptor to attach the token to each request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from cookie
    const token = cookiesInstance.get('access_token')

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // Handle request error
    return Promise.reject(error)
  }
)

// Response interceptor (optional)
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response
  },
  async (error) => {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status == 401) {
        // Check if we've already tried to retry this request
        if (error.config._retry) {
          // We've already retried once, don't retry again
          sessionStorage.removeItem('access_token')
          localStorage.removeItem('access_token')
          return Promise.reject(error)
        }
      }
    }

    return Promise.reject(error)
  }
)

export { axiosInstance, adminAxiosInstance }
