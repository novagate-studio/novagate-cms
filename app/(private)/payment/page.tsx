'use client'

import { useEffect, useState } from 'react'
import { getPaymentStatistics, PaymentStatistics, getDepositPackages, DepositPackage } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, DollarSign, TrendingDown, UserCog } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CreateDepositPackageDialog } from './components/create-deposit-package-dialog'
import { EditDepositPackageDialog } from './components/edit-deposit-package-dialog'

export default function PaymentPage() {
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [depositPackages, setDepositPackages] = useState<DepositPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<DepositPackage | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        const response = await getPaymentStatistics()
        setStatistics(response.data)
      } catch (err) {
        console.error('Failed to fetch payment statistics:', err)
        setError('Không thể tải thống kê thanh toán')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
    fetchDepositPackages()
  }, [])

  const fetchDepositPackages = async () => {
    try {
      setLoadingPackages(true)
      const response = await getDepositPackages({
        orderBy: 'from_amount',
        orderDirection: 'desc',
        offset: 0,
        limit: 100,
      })
      setDepositPackages(response.data)
    } catch (err) {
      console.error('Failed to fetch deposit packages:', err)
    } finally {
      setLoadingPackages(false)
    }
  }

  const handleCreateSuccess = () => {
    fetchDepositPackages()
  }

  const handleEditClick = (pkg: DepositPackage) => {
    setSelectedPackage(pkg)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchDepositPackages()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>Thanh toán</h1>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-4' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-24' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !statistics) {
    return (
      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>Thanh toán</h1>
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-muted-foreground'>{error || 'Không có dữ liệu'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      title: 'Tổng nạp coin',
      value: statistics.total_deposit_coin.aggregate.sum.amount || 0,
      icon: Coins,
      suffix: 'coin',
    },
    {
      title: 'Tổng nạp coin (Admin)',
      value: statistics.total_deposit_coin_by_admin.aggregate.sum.amount || 0,
      icon: UserCog,
      suffix: 'coin',
    },
    {
      title: 'Tổng nạp VNĐ',
      value: statistics.total_deposit_vnd.aggregate.sum.amount || 0,
      icon: DollarSign,
      suffix: 'đ',
    },
    {
      title: 'Tổng chuyển coin',
      value: statistics.total_transfer_coin.aggregate.sum.amount || 0,
      icon: TrendingDown,
      suffix: 'coin',
    },
  ]

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Thanh toán</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                    <Icon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {formatNumber(stat.value)} {stat.suffix}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle>Danh sách gói nạp tiền</CardTitle>
          <CreateDepositPackageDialog onSuccess={handleCreateSuccess} />
        </CardHeader>
        <CardContent>
          {loadingPackages ? (
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : depositPackages.length === 0 ? (
            <p className='text-center text-muted-foreground py-8'>Không có gói nạp tiền nào</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Số tiền nạp</TableHead>
                  <TableHead>Số coin nhận</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositPackages.map((pkg) => (
                  <TableRow key={pkg.id} className='cursor-pointer hover:bg-muted/50' onClick={() => handleEditClick(pkg)}>
                    <TableCell className='font-medium'>{pkg.id}</TableCell>
                    <TableCell>
                      {formatNumber(pkg.from_amount)} {pkg.from_currency}
                    </TableCell>
                    <TableCell>
                      {formatNumber(pkg.to_amount)} {pkg.to_currency}
                    </TableCell>
                    <TableCell className='capitalize'>{pkg.payment_method}</TableCell>
                    <TableCell>
                      {pkg.is_active ? (
                        <Badge variant='default'>Hoạt động</Badge>
                      ) : (
                        <Badge variant='secondary'>Không hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(pkg.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{format(new Date(pkg.updated_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditDepositPackageDialog
        package={selectedPackage}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
