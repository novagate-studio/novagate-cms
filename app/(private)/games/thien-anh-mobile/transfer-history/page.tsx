'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getThienAnhTransferHistories, ThienAnhTransferHistory } from '@/services/game'
import { debounce } from 'lodash'
import { Search } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { format } from 'date-fns'
const LIMIT = 50
export default function LichSuChuyenTienPage() {
  const [histories, setHistories] = useState<ThienAnhTransferHistory[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at_desc')

  const getSortParams = (sortValue: string) => {
    const parts = sortValue.split('_')
    const direction = parts[parts.length - 1]
    const field = parts.slice(0, -1).join('_')
    return {
      orderBy: field,
      orderDirection: direction || 'desc',
    }
  }

  const fetchHistories = useCallback(
    async (offset = 0, isNewSearch = false) => {
      try {
        const { orderBy, orderDirection } = getSortParams(sort)
        const response = await getThienAnhTransferHistories({
          search: search || undefined,
          orderBy,
          orderDirection,
          offset,
          limit: LIMIT,
        })

        if (response.code === 200 && response.data) {
          const newHistories = response.data || []
          setHistories((prev) => (isNewSearch ? newHistories : [...prev, ...newHistories]))
          setHasMore(newHistories.length === LIMIT)
        }
      } catch (error) {
        console.error('Error fetching transfer histories:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [search, sort]
  )

  const debouncedFetchHistories = useMemo(() => debounce(() => fetchHistories(0, true), 500), [fetchHistories])

  useEffect(() => {
    setIsLoading(true)
    setHistories([])
    debouncedFetchHistories()
    return () => {
      debouncedFetchHistories.cancel()
    }
  }, [search, sort, debouncedFetchHistories])

  const fetchMoreHistories = () => {
    fetchHistories(histories.length, false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'KNB', maximumFractionDigits: 0 }).format(
      amount
    )
  }

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge variant='default'>Cộng coin</Badge>
      case 2:
        return <Badge variant='secondary'>Trừ coin</Badge>
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Lịch sử chuyển Coin</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo tên người dùng, admin...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='created_at_desc'>Mới nhất</SelectItem>
                <SelectItem value='created_at_asc'>Cũ nhất</SelectItem>
                <SelectItem value='amount_desc'>Số coin cao nhất</SelectItem>
                <SelectItem value='amount_asc'>Số coin thấp nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className='space-y-3'>
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : histories.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground'>Không có dữ liệu</div>
          ) : (
            <InfiniteScroll
              dataLength={histories.length}
              next={fetchMoreHistories}
              hasMore={hasMore}
              loader={
                <div className='space-y-3 mt-3'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-16 w-full' />
                  ))}
                </div>
              }
              endMessage={
                <p className='text-center text-muted-foreground py-4'>
                  {histories.length > 0 ? 'Đã hiển thị tất cả giao dịch' : ''}
                </p>
              }>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số coin</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {histories.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell className='font-medium'>{history.id}</TableCell>
                        <TableCell>
                          {history.user ? (
                            <div>
                              <div className='font-medium'>{history.user.user_name}</div>
                              <div className='text-xs text-muted-foreground'>ID: {history.user.id}</div>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {history.admin ? (
                            <div>
                              <div className='font-medium'>{history.admin.user_name}</div>
                              <div className='text-xs text-muted-foreground'>ID: {history.admin.id}</div>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>{getTypeBadge(history.type)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              history.type === 1 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
                            }>
                            {history.type === 1 ? '+' : '-'}
                            {formatCurrency(history.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{history.gateway_id}</TableCell>
                        <TableCell>
                          {history.note ? (
                            <span className='text-sm'>{history.note}</span>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>{format(new Date(history.created_at), 'dd/MM/yyyy HH:mm')}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
