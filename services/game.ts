import { adminAxiosInstance } from './axios'
import { ResponseData } from './index'

export interface Game {
  id: number
  name: string
  ingame_currency_name: string
  image_url: string
  status: string
  created_at: string
  updated_at: string
}

export interface Server {
  id: number
  name: string
}

export const getGamesList = async (params?: { offset?: number; limit?: number }): Promise<ResponseData<Game[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/games/list', { params })
  return response.data
}

export const getServersList = async (): Promise<ResponseData<Server[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/games/thien-anh/servers')
  return response.data
}
