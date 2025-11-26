import { OutputData } from '@editorjs/editorjs'
import { adminAxiosInstance } from './axios'
import { ResponseData } from './index'

export interface Article {
  id: number
  title: string
  description: string
  content: OutputData
  banner: string
  thumbnail: string
  tags: string
  created_at: string
  updated_at: string
  slug: string
}

export interface CreateArticleRequest {
  title: string
  description: string
  content: OutputData
  banner: string
  thumbnail: string
  tags: string
  game_id: number
}

export const createArticle = async (data: CreateArticleRequest): Promise<ResponseData<Article>> => {
  const response = await adminAxiosInstance.post('/api/v2/articles', data)
  return response.data
}

export const uploadFile = async (file: File): Promise<ResponseData<{ url: string }>> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await adminAxiosInstance.post('/api/v2/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getArticles = async (params?: {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: string
  search?: string
  game_id?: number
}): Promise<ResponseData<Article[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/articles', { params })
  return response.data
}
export const getArticleBySlug = async (slug: string): Promise<ResponseData<Article>> => {
  const response = await adminAxiosInstance.get(`/api/v2/articles/${slug}`)
  return response.data
}
export const updateArticle = async (
  id: number,
  data: Partial<CreateArticleRequest>
): Promise<ResponseData<Article>> => {
  const response = await adminAxiosInstance.put(`/api/v2/articles/${id}`, data)
  return response.data
}

export const deleteArticle = async (id: number): Promise<ResponseData<null>> => {
  const response = await adminAxiosInstance.delete(`/api/v2/articles/${id}`)
  return response.data
}