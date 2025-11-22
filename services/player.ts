import { Player, Account } from '@/models/player'
import { ResponseData } from '.'
import { adminAxiosInstance } from './axios'

export const getPlayersList = async (params: {
  search?: string
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
}): Promise<ResponseData<Player[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/users/list', { params })
  return response.data
}

export const searchAccounts = async (username: string): Promise<ResponseData<Account[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/accounts/thien-anh/find', {
    params: { username },
  })
  return response.data
}

export const getPlayerDetail = async (id: string): Promise<ResponseData<Player>> => {
  const response = await adminAxiosInstance.get(`/api/v2/users/${id}`)
  return response.data
}

export const getPlayerWallets = async (id: string): Promise<ResponseData<any[]>> => {
  const response = await adminAxiosInstance.get(`/api/v2/users/${id}/wallets`)
  return response.data
}

export const getPlayerAccountLogs = async (id: string): Promise<ResponseData<any[]>> => {
  const response = await adminAxiosInstance.get(`/api/v2/users/${id}/account-logs`)
  return response.data
}

export const getPlayerActivityLogs = async (id: string): Promise<ResponseData<any[]>> => {
  const response = await adminAxiosInstance.get(`/api/v2/users/${id}/activity-logs`)
  return response.data
}

export const updatePlayer = async (
  id: string,
  data: {
    full_name?: string
    dob?: string
    gender?: string
    address?: string
    email?: string
    phone?: string
    status?: string
  }
): Promise<ResponseData<Player>> => {
  const response = await adminAxiosInstance.put(`/api/v2/users/${id}`, data)
  return response.data
}

export const manualDeposit = async (
  id: string,
  data: {
    amount: number
    note: string
  }
): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.post(`/api/v2/users/${id}/wallets/manual-deposit`, data)
  return response.data
}

export const resetPassword = async (id: string): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.post(`/api/v2/users/${id}/reset-password`)
  return response.data
}
