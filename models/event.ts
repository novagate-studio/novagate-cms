export interface Event {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  gift_codes_count: string
}

export interface CreateEventRequest {
  title: string
  description: string
}


export interface UpdateEventRequest {
  title: string
  description: string
}

export interface UpdateEventResponse {
  code: number
  status: boolean
  message?: string
  errors?: {
    vi?: string
  }
}

export interface DeleteEventResponse {
  code: number
  status: boolean
  message?: string
  errors?: {
    vi?: string
  }
}
