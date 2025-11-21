import {
  CreateEventRequest,
  Event,
  UpdateEventRequest,
} from '@/models/event'
import { ResponseData } from '.'
import { adminAxiosInstance } from './axios'

export const getEventsList = async (params?: {
  search?: string
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
}): Promise<ResponseData<Event[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/events/thien-anh', {
    params,
  })
  return response.data
}

export const createEvent = async (data: CreateEventRequest): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.post('/api/v2/events/thien-anh', data)
  return response.data
}

export const updateEvent = async (id: number, data: UpdateEventRequest): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.put(`/api/v2/events/thien-anh/${id}`, data)
  return response.data
}

export const deleteEvent = async (id: number): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.delete(`/api/v2/events/thien-anh/${id}`)
  return response.data
}
