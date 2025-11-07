export interface PlayerWallet {
  balance: number
  currency: string
}

export interface Player {
  id: string
  username: string
  full_name: string
  email: string
  phone: string
  roles: string
  address: string
  dob: string
  gender: string
  phone_verified: boolean
  phone_verified_at: string
  status: string
  total_deposit: number
  total_transfer: number
  created_at: string
  user_wallets: PlayerWallet[]
}
