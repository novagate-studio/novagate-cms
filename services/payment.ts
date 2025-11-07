import { adminAxiosInstance } from './axios'
import { ResponseData } from './index'

export interface PaymentStatistics {
  total_deposit_coin: {
    aggregate: {
      sum: {
        amount: number
      }
    }
  }
  total_deposit_coin_by_admin: {
    aggregate: {
      sum: {
        amount: number
      }
    }
  }
  total_deposit_vnd: {
    aggregate: {
      sum: {
        amount: number
      }
    }
  }
  total_transfer_coin: {
    aggregate: {
      sum: {
        amount: number
      }
    }
  }
}

export interface DepositPackage {
  id: number
  from_amount: number
  from_currency: string
  is_active: boolean
  to_amount: number
  to_currency: string
  payment_method: string
  created_at: string
  updated_at: string
}

export const getPaymentStatistics = async (): Promise<ResponseData<PaymentStatistics>> => {
  const response = await adminAxiosInstance.get('/api/v2/payment/statistics')
  return response.data
}

export const getDepositPackages = async (params?: {
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
}): Promise<ResponseData<DepositPackage[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/payment/deposit-packages', { params })
  return response.data
}

export const createDepositPackage = async (data: {
  from_amount: number
  to_amount: number
  from_currency: string
  to_currency: string
  is_active: boolean
}): Promise<ResponseData<DepositPackage>> => {
  const response = await adminAxiosInstance.post('/api/v2/payment/deposit-packages', data)
  return response.data
}

export const updateDepositPackage = async (
  id: number,
  data: {
    from_amount: number
    to_amount: number
    from_currency: string
    to_currency: string
    is_active: boolean
  }
): Promise<ResponseData<DepositPackage>> => {
  const response = await adminAxiosInstance.put(`/api/v2/payment/deposit-packages/${id}`, data)
  return response.data
}

export const deleteDepositPackage = async (id: number): Promise<ResponseData<any>> => {
  const response = await adminAxiosInstance.delete(`/api/v2/payment/deposit-packages/${id}`)
  return response.data
}

export interface DepositHistory {
  id: number
  balance_before: number | null
  balance_after: number
  amount: number
  note: string
  type: string
  ip: string | null
  created_at: string
  user: {
    address: string
    created_at: string
    dob: string
    email: string
    full_name: string
    gender: string
    id: string
    phone: string
    status: string
    total_deposit: number
    total_transfer: number
    username: string
    updated_at: string
  }
  wallet_deposits: Array<{
    id: number
    status: string
    method: string
    transaction_code: string
    bank: {
      id: number
      name: string
      logo_url: string
      short_name: string
    }
    from_amount: number
    from_currency: string
    to_amount: number
    to_currency: string
    created_at: string
  }>
}

export const getDepositHistories = async (params?: {
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
  search?: string
}): Promise<ResponseData<DepositHistory[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/payment/deposit-histories', { params })
  return response.data
}

export const getDepositHistoryDetail = async (id: number): Promise<ResponseData<DepositHistory>> => {
  const response = await adminAxiosInstance.get(`/api/v2/payment/deposit-histories/${id}`)
  return response.data
}

export interface TransferHistory {
  id: number
  balance_before: number | null
  balance_after: number
  amount: number
  note: string
  type: string
  ip: string | null
  created_at: string
  updated_at: string
  user: {
    address: string
    created_at: string
    dob: string
    email: string
    full_name: string
    gender: string
    id: string
    phone: string
    status: string
    total_deposit: number
    total_transfer: number
    username: string
    updated_at: string
  }
  wallet_transfers: Array<{
    id: number
    game: {
      id: number
      name: string
      ingame_currency_name: string
      image_url: string
      status: string
    }
    game_server: {
      id: number
      name: string
    }
    game_character: {
      id: number
      name: string
    }
    amount_coin: number
    amount_ingame: number
    status: string
    created_at: string
    completed_at: string
  }>
}

export const getTransferHistories = async (params?: {
  orderBy?: string
  orderDirection?: string
  offset?: number
  limit?: number
  search?: string
  gameId?: number
}): Promise<ResponseData<TransferHistory[]>> => {
  const response = await adminAxiosInstance.get('/api/v2/payment/transfer-histories', { params })
  return response.data
}

export const getTransferHistoryDetail = async (id: number): Promise<ResponseData<TransferHistory>> => {
  const response = await adminAxiosInstance.get(`/api/v2/payment/transfer-histories/${id}`)
  return response.data
}
