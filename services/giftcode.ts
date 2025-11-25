import { GiftCode, CreateGiftCodeRequest } from '@/models/giftcode'
import { ResponseData } from '.'
import { adminAxiosInstance } from './axios'

export const getGiftCodesList = async (params?: {
  search?: string
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
  code?: string
  giftItemDescription?: string
  giftMoneyDescription?: string
  usageType?: number
  serverId?: number
  userId?: number
  eventId?: number
  adminId?: number
  startTime?: string
  endTime?: string
}): Promise<ResponseData<GiftCode[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/giftcodes/thien-anh', {
    params,
  })
  return response.data
}

export const createGiftCode = async (data: CreateGiftCodeRequest): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.post('/api/v2/giftcodes/thien-anh', data)
  return response.data
}

export const updateGiftCode = async (id: number, data: CreateGiftCodeRequest): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.put(`/api/v2/giftcodes/thien-anh/${id}`, data)
  return response.data
}

export const deleteGiftCode = async (id: number): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.delete(`/api/v2/giftcodes/thien-anh/${id}`)
  return response.data
}

export const bulkDeleteGiftCodes = async (ids: number[]): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.delete('/api/v2/giftcodes/thien-anh/bulk', {
    data: { ids },
  })
  return response.data
}
