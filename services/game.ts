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

export interface ThienAnhStats {
  total_accounts: number
  total_characters: number
  total_revenue: number
  total_revenue_last_month: number
}

export interface ThienAnhTransferHistory {
  id: number
  created_at: string
  updated_at: string
  user_id: number
  user: {
    id: number
    user_name: string
  } | null
  admin_id: number | null
  admin: {
    id: number
    user_name: string
  } | null
  amount: number
  in_flow_cost: number
  type: number
  gateway_id: number
  note: string | null
}

export const getGamesList = async (params?: { offset?: number; limit?: number }): Promise<ResponseData<Game[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/games/list', { params })
  return response.data
}

export const getServersList = async (): Promise<ResponseData<Server[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/games/thien-anh/servers')
  return response.data
}

export const getThienAnhOverview = async (): Promise<ResponseData<ThienAnhStats>> => {
  const response = await adminAxiosInstance.get('/api/v2/stats/thien-anh/overview')
  return response.data
}

export const getThienAnhTransferHistories = async (params?: {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: string
  search?: string
}): Promise<ResponseData<ThienAnhTransferHistory[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/transactions/thien-anh/transfer-histories', { params })
  return response.data
}
