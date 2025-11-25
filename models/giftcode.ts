export interface GiftCode {
  id: number
  created_at: string
  updated_at: string
  code: string
  usage_type: number
  gift_item_description: string
  gift_money_description: string
  server_id: number | null
  server: {
    id: number
    name: string
  } | null
  user_id: number | null
  user: {
    id: number
    user_name: string
  } | null
  admin_id: number
  admin: {
    id: number
    user_name: string
  }
  start_time: string | null
  end_time: string | null
  event_id: number | null
  event: {
    id: number
    title: string
    description: string
  } | null
}

export interface CreateGiftCodeRequest {
  code: string
  usageType: number
  totalGiftCodes: number
  giftItemDescription: string
  giftMoneyDescription: string
  serverId: number
  userId: string
  eventId: number
  startTime: number
  endTime: number
}
