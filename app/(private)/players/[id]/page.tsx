'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPlayerDetail, getPlayerWallets, getPlayerAccountLogs, getPlayerActivityLogs } from '@/services/player'
import { Player } from '@/models/player'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Check, Pencil, Wallet } from 'lucide-react'
import { ManualDepositDialog } from './components/manual-deposit-dialog'
import { ResetPasswordDialog } from './components/reset-password-dialog'

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [wallets, setWallets] = useState<any[]>([])
  const [accountLogs, setAccountLogs] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true)
        const [detailResponse, walletsResponse, accountLogsResponse, activityLogsResponse] = await Promise.all([
          getPlayerDetail(params.id as string),
          getPlayerWallets(params.id as string),
          getPlayerAccountLogs(params.id as string),
          getPlayerActivityLogs(params.id as string),
        ])
        
        setPlayer(detailResponse.data)
        setWallets(walletsResponse.data || [])
        setAccountLogs(accountLogsResponse.data || [])
        setActivityLogs(activityLogsResponse.data || [])
      } catch (err) {
        console.error('Failed to fetch player data:', err)
        setError('Không thể tải thông tin người chơi')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayerData()
    }
  }, [params.id])

  const handleDepositSuccess = async () => {
    // Reload player data and wallets after successful deposit
    try {
      const [detailResponse, walletsResponse] = await Promise.all([
        getPlayerDetail(params.id as string),
        getPlayerWallets(params.id as string),
      ])
      setPlayer(detailResponse.data)
      setWallets(walletsResponse.data || [])
    } catch (err) {
      console.error('Failed to refresh player data:', err)
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

  if (error || !player) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' onClick={() => router.push('/')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-muted-foreground'>{error || 'Không tìm thấy người chơi'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' onClick={() => router.push('/')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <div className='flex gap-2'>
          <ResetPasswordDialog 
            playerId={params.id as string} 
            playerName={player?.username || player?.full_name}
          />
          <ManualDepositDialog playerId={params.id as string} onSuccess={handleDepositSuccess} />
          <Button onClick={() => router.push(`/players/${params.id}/edit`)}>
            <Pencil className='mr-2 h-4 w-4' />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Username</p>
                <p className='font-medium'>{player.username}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Họ tên</p>
                <p className='font-medium'>{player.full_name || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='font-medium'>{player.email || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số điện thoại</p>
                <p className='font-medium'>{player.phone || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Địa chỉ</p>
                <p className='font-medium'>{player.address || '-'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Ngày sinh</p>
                <p className='font-medium'>
                  {player.dob ? new Date(player.dob).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Giới tính</p>
                <p className='font-medium'>
                  {player.gender === 'male' ? 'Nam' : player.gender === 'female' ? 'Nữ' : '-'}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Vai trò</p>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {player.roles
                    ? player.roles.split(',').map((role, index) => (
                        <Badge
                          key={index}
                          variant={role.trim() === 'admin' ? 'default' : 'secondary'}
                          className={role.trim() === 'admin' ? 'bg-purple-500 hover:bg-purple-600' : ''}>
                          {role.trim()}
                        </Badge>
                      ))
                    : '-'}
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Trạng thái</p>
                <div className='mt-1'>
                  <Badge
                    variant={player.status === 'created' ? 'default' : 'outline'}
                    className='bg-green-500 hover:bg-green-600'>
                    {player.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Xác thực số điện thoại</p>
                <div className='mt-1'>
                  {player.phone_verified ? (
                    <Badge variant='default' className='bg-green-500 hover:bg-green-600'>
                      <Check className='h-3 w-3 mr-1' />
                      Đã xác thực
                    </Badge>
                  ) : (
                    <Badge variant='secondary'>Chưa xác thực</Badge>
                  )}
                </div>
              </div>
              {player.phone_verified_at && (
                <div>
                  <p className='text-sm text-muted-foreground'>Ngày xác thực</p>
                  <p className='font-medium'>{new Date(player.phone_verified_at).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Ngày tạo</p>
                <p className='font-medium'>
                  {player.created_at ? new Date(player.created_at).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách ví</CardTitle>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>Không có dữ liệu ví</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại ví</TableHead>
                    <TableHead>Số dư</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>{wallet.currency || '-'}</TableCell>
                      <TableCell>{wallet.balance || 0}</TableCell>
                      <TableCell>
                        <Badge variant='default' className='bg-green-500 hover:bg-green-600'>
                          Hoạt động
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            {accountLogs.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>Không có lịch sử giao dịch</p>
            ) : (
              <div className='max-h-96 overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số dư trước</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Số dư sau</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.type === 'deposit' ? 'default' : 'secondary'}
                            className={log.type === 'deposit' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}>
                            {log.type === 'deposit' ? 'Nạp tiền' : log.type === 'transfer' ? 'Chuyển' : log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>{log.balance_before ?? '-'}</TableCell>
                        <TableCell className='font-bold text-green-600'>{log.amount || 0}</TableCell>
                        <TableCell className='font-medium'>{log.balance_after ?? '-'}</TableCell>
                        <TableCell>{log.note || '-'}</TableCell>
                        <TableCell className='text-muted-foreground text-xs'>{log.ip || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhật ký hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <p className='text-center text-muted-foreground py-4'>Không có nhật ký hoạt động</p>
            ) : (
              <div className='max-h-96 overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Thiết bị</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.action === 'login' ? 'default' : 'secondary'}
                            className={log.action === 'login' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                            {log.action === 'login' ? 'Đăng nhập' : log.action === 'update_password' ? 'Đổi mật khẩu' : log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm'>
                          {log.city && log.country ? `${log.city}, ${log.country}` : '-'}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-xs'>{log.ip_address || '-'}</TableCell>
                        <TableCell className='text-sm'>{log.user_agent_formatted || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
