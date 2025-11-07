'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDepositHistoryDetail } from '@/services/payment'
import { DepositHistory } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default function DepositHistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [history, setHistory] = useState<DepositHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      try {
        setLoading(true)
        const response = await getDepositHistoryDetail(Number(params.id))
        setHistory(response.data)
      } catch (err) {
        console.error('Failed to fetch deposit history detail:', err)
        setError('Không thể tải thông tin lịch sử nạp tiền')
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
      case 'deposit':
        return 'Nạp tiền'
      case 'withdraw':
        return 'Rút tiền'
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
        <Button variant='ghost' onClick={() => router.push('/deposit-history')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-muted-foreground'>{error || 'Không tìm thấy lịch sử nạp tiền'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Button variant='ghost' onClick={() => router.push('/deposit-history')}>
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

        {/* Wallet Deposit Information */}
        {history.wallet_deposits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nạp tiền qua ví</CardTitle>
            </CardHeader>
            <CardContent>
              {history.wallet_deposits.map((deposit) => (
                <div key={deposit.id} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>ID nạp tiền</p>
                      <p className='font-medium'>#{deposit.id}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Trạng thái</p>
                      <Badge variant={deposit.status === 'success' ? 'default' : 'secondary'}>
                        {deposit.status === 'success' ? 'Thành công' : deposit.status}
                      </Badge>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Phương thức</p>
                      <p className='font-medium capitalize'>{deposit.method}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Mã giao dịch</p>
                      <p className='font-mono text-sm'>{deposit.transaction_code}</p>
                    </div>
                    {deposit.bank && (
                      <>
                        <div>
                          <p className='text-sm text-muted-foreground'>Ngân hàng</p>
                          <div className='flex items-center gap-2'>
                            {deposit.bank.logo_url && (
                              <img src={deposit.bank.logo_url} alt={deposit.bank.name} className='h-6 w-6 object-contain' />
                            )}
                            <p className='font-medium'>{deposit.bank.name}</p>
                          </div>
                        </div>
                        <div>
                          <p className='text-sm text-muted-foreground'>Tên ngắn</p>
                          <p className='font-medium'>{deposit.bank.short_name}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className='text-sm text-muted-foreground'>Số tiền nạp</p>
                      <p className='font-medium'>
                        {formatNumber(deposit.from_amount)} {deposit.from_currency}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Số coin nhận</p>
                      <p className='font-medium'>
                        {formatNumber(deposit.to_amount)} {deposit.to_currency}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Ngày tạo</p>
                      <p className='font-medium'>{format(new Date(deposit.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
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
