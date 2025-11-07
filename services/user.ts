import { User } from '@/models/user'
import { ResponseData } from '.'
import { axiosInstance } from './axios'
import { UserActivity } from '@/models/activity'

export const getProfile = async (): Promise<ResponseData<User>> => {
  const response = await axiosInstance.get('/api/v2/auth/getProfile')
  return response.data
}

export const addIdentityDocument = async (document: {
  document_number: string
  document_type: string
  place_of_issue: string
  issue_date: string
  captcha: string
}): Promise<ResponseData<User>> => {
  const response = await axiosInstance.post('/api/v2/auth/addIdentityDocument', document)
  return response.data
}

export const changeEmail = async (data: {
  email: string
  new_email: string
  captcha: string
}): Promise<ResponseData<any>> => {
  const response = await axiosInstance.post('/api/v2/auth/changeEmail', data)
  return response.data
}

export const changePhone = async (data: {
  phone: string
  new_phone: string
  captcha: string
}): Promise<ResponseData<any>> => {
  const response = await axiosInstance.post('/api/v2/auth/changePhone', data)
  return response.data
}

export const updateProfile = async (data: {
  full_name: string
  dob: string
  gender: string
  address: string
  captcha: string
}): Promise<ResponseData<any>> => {
  const response = await axiosInstance.post('/api/v2/auth/updateProfile', data)
  return response.data
}
export const getUserActivities = async (): Promise<UserActivity[]> => {
  const response = await axiosInstance.get('/api/v2/userActivityLogs')
  return response.data?.data?.user_activity_logs || []
}
