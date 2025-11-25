'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getTransferHistories, TransferHistory } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { debounce } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Search } from 'lucide-react'

export default function TransferHistoryPage() {
  const router = useRouter()
  const [histories, setHistories] = useState<TransferHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at_desc')
  const [offset, setOffset] = useState(0)
  const limit = 50

  const getSortParams = (sortValue: string) => {
    // Handle created_at specially since it contains underscore
    if (sortValue.startsWith('created_at_')) {
      return {
        orderBy: 'created_at',
        orderDirection: sortValue.split('created_at_')[1],
      }
    }
    // For other fields like amount_desc, amount_asc
    const parts = sortValue.split('_')
    return {
      orderBy: parts[0],
      orderDirection: parts[1],
    }
  }

  const fetchHistories = async (searchQuery: string, sortValue: string, offsetValue: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true)
      const { orderBy, orderDirection } = getSortParams(sortValue)
      const response = await getTransferHistories({
        orderBy,
        orderDirection,
        offset: offsetValue,
        limit,
        search: searchQuery || undefined,
      })

      if (isLoadMore) {
        setHistories((prev) => [...prev, ...response.data])
      } else {
        setHistories(response.data)
      }

      setHasMore(response.data.length === limit)
    } catch (err) {
      console.error('Failed to fetch transfer histories:', err)
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setOffset(0)
      setHistories([])
      fetchHistories(searchQuery, sort, 0, false)
    }, 500),
    [sort]
  )

  useEffect(() => {
    fetchHistories('', sort, 0, false)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    setOffset(0)
    setHistories([])
    fetchHistories(search, value, 0, false)
  }

  const loadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)
    fetchHistories(search, sort, newOffset, true)
  }

  const formatNumber = (num: number | null) => {
    if (num === null) return '-'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'Chuyển coin'
      default:
        return type
    }
  }

  if (loading && histories.length === 0) {
    return (
      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>Lịch sử chuyển Coin</h1>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-64' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Lịch sử chuyển Coin</h1>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch sử chuyển coin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo tên, email, số điện thoại...'
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='created_at_desc'>Mới nhất</SelectItem>
                <SelectItem value='created_at_asc'>Cũ nhất</SelectItem>
                <SelectItem value='amount_desc'>Số coin giảm dần</SelectItem>
                <SelectItem value='amount_asc'>Số coin tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <InfiniteScroll
            dataLength={histories.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className='py-4 text-center'>
                <Skeleton className='h-10 w-full' />
              </div>
            }
            endMessage={
              <p className='py-4 text-center text-sm text-muted-foreground'>
                {histories.length === 0 ? 'Không có lịch sử chuyển coin nào' : 'Đã tải hết dữ liệu'}
              </p>
            }>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Số dư trước</TableHead>
                  <TableHead>Số dư sau</TableHead>
                  <TableHead>Số coin</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.map((history) => (
                  <TableRow
                    key={history.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => router.push(`/transfer-history/${history.id}`)}>
                    <TableCell className='font-medium'>{history.id}</TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{history.user.username}</span>
                        <span className='text-sm text-muted-foreground'>{history.user.full_name}</span>
                        <span className='text-xs text-muted-foreground'>{history.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(history.balance_before)}</TableCell>
                    <TableCell>{formatNumber(history.balance_after)}</TableCell>
                    <TableCell className='font-semibold'>{formatNumber(history.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{getTypeLabel(history.type)}</Badge>
                    </TableCell>
                    <TableCell className='max-w-[200px] truncate'>{history.note || '-'}</TableCell>
                    <TableCell>
                      {history.wallet_transfers.length > 0 ? (
                        <div className='flex items-center gap-2'>
                          {history.wallet_transfers[0].game.image_url && (
                            <img
                              src={history.wallet_transfers[0].game.image_url}
                              alt={history.wallet_transfers[0].game.name}
                              className='h-8 w-8 rounded object-cover'
                            />
                          )}
                          <span className='text-sm'>{history.wallet_transfers[0].game.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {history.wallet_transfers.length > 0 ? (
                        <Badge variant={history.wallet_transfers[0].status === 'success' ? 'default' : 'secondary'}>
                          {history.wallet_transfers[0].status === 'success'
                            ? 'Thành công'
                            : history.wallet_transfers[0].status}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-xs font-mono'>{history.ip || '-'}</TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfiniteScroll>
        </CardContent>
      </Card>
    </div>
  )
}
