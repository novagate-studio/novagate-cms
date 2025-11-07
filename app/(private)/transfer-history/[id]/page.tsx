'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTransferHistoryDetail } from '@/services/payment'
import { TransferHistory } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default function TransferHistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [history, setHistory] = useState<TransferHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      try {
        setLoading(true)
        const response = await getTransferHistoryDetail(Number(params.id))
        setHistory(response.data)
      } catch (err) {
        console.error('Failed to fetch transfer history detail:', err)
        setError('Không thể tải thông tin lịch sử chuyển tiền')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchHistoryDetail()
    }
  }, [params.id])

  const formatNumber = (num: number | null) => {
    if (num === null) return '-'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'Chuyển tiền'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-64' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-6 w-full' />
            <Skeleton className='h-6 w-full' />
            <Skeleton className='h-6 w-full' />
            <Skeleton className='h-6 w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !history) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' onClick={() => router.push('/transfer-history')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-muted-foreground'>{error || 'Không tìm thấy lịch sử chuyển tiền'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Button variant='ghost' onClick={() => router.push('/transfer-history')}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Quay lại
      </Button>

      <div className='grid gap-6'>
        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>ID giao dịch</p>
                <p className='font-medium'>#{history.id}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Loại giao dịch</p>
                <Badge variant='outline'>{getTypeLabel(history.type)}</Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số dư trước</p>
                <p className='font-medium'>{formatNumber(history.balance_before)} Coin</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số dư sau</p>
                <p className='font-medium'>{formatNumber(history.balance_after)} Coin</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số tiền</p>
                <p className='font-semibold text-lg'>{formatNumber(history.amount)} Coin</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>IP</p>
                <p className='font-mono text-sm'>{history.ip || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ghi chú</p>
                <p className='font-medium'>{history.note || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ngày tạo</p>
                <p className='font-medium'>{format(new Date(history.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ngày cập nhật</p>
                <p className='font-medium'>{format(new Date(history.updated_at), 'dd/MM/yyyy HH:mm:ss')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Username</p>
                <p className='font-medium'>{history.user.username}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Họ tên</p>
                <p className='font-medium'>{history.user.full_name}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='font-medium'>{history.user.email}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số điện thoại</p>
                <p className='font-medium'>{history.user.phone}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Địa chỉ</p>
                <p className='font-medium'>{history.user.address || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Trạng thái</p>
                <Badge>{history.user.status}</Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tổng nạp</p>
                <p className='font-medium'>{formatNumber(history.user.total_deposit)} Coin</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tổng chuyển</p>
                <p className='font-medium'>{formatNumber(history.user.total_transfer)} Coin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Transfer Information */}
        {history.wallet_transfers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyển tiền vào game</CardTitle>
            </CardHeader>
            <CardContent>
              {history.wallet_transfers.map((transfer) => (
                <div key={transfer.id} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>ID chuyển tiền</p>
                      <p className='font-medium'>#{transfer.id}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Trạng thái</p>
                      <Badge variant={transfer.status === 'success' ? 'default' : 'secondary'}>
                        {transfer.status === 'success' ? 'Thành công' : transfer.status}
                      </Badge>
                    </div>
                    <div className='md:col-span-2'>
                      <p className='text-sm text-muted-foreground mb-2'>Game</p>
                      <div className='flex items-center gap-3'>
                        {transfer.game.image_url && (
                          <img 
                            src={transfer.game.image_url} 
                            alt={transfer.game.name}
                            className='h-16 w-16 rounded-lg object-cover'
                          />
                        )}
                        <div>
                          <p className='font-medium text-lg'>{transfer.game.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            Tiền tệ: {transfer.game.ingame_currency_name}
                          </p>
                          <Badge variant='outline' className='mt-1'>
                            {transfer.game.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Server</p>
                      <p className='font-medium'>{transfer.game_server.name}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Nhân vật</p>
                      <p className='font-medium'>{transfer.game_character.name}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Số Coin</p>
                      <p className='font-medium'>{formatNumber(transfer.amount_coin)} Coin</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Số {transfer.game.ingame_currency_name}</p>
                      <p className='font-medium'>{formatNumber(transfer.amount_ingame)} {transfer.game.ingame_currency_name}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Ngày tạo</p>
                      <p className='font-medium'>{format(new Date(transfer.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Ngày hoàn thành</p>
                      <p className='font-medium'>{format(new Date(transfer.completed_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
