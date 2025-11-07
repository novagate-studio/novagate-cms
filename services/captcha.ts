import { ResponseData } from '.'
import { axiosInstance } from './axios'

// Fetch captcha image
export const getCaptcha = async (): Promise<string> => {
  const response = await axiosInstance.get('/api/v2/captcha')
  return response.data.image
}
export const verifyCaptcha = async (captcha: string): Promise<ResponseData<any>> => {
  const response = await axiosInstance.post('/api/v2/captcha/verify', { captcha })
  return response.data
}
