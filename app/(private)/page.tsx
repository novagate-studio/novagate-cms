'use client'

import { debounce } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Player } from '@/models/player';
import { getPlayersList } from '@/services/player';

export default function Home() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [offset, setOffset] = useState(0)
  const [limit] = useState(20)

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value)
      }, 500),
    []
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // Convert sort option to orderBy and orderDirection
  const getSortParams = (option: string) => {
    switch (option) {
      case 'newest':
        return { orderBy: 'created_at', orderDirection: 'desc' }
      case 'oldest':
        return { orderBy: 'created_at', orderDirection: 'asc' }
      case 'coin_asc':
        return { orderBy: 'total_deposit', orderDirection: 'asc' }
      case 'coin_desc':
        return { orderBy: 'total_deposit', orderDirection: 'desc' }
      default:
        return { orderBy: 'created_at', orderDirection: 'desc' }
    }
  }

  const fetchPlayers = async (reset: boolean = false) => {
    try {
      const currentOffset = reset ? 0 : offset
      const { orderBy, orderDirection } = getSortParams(sortOption)
      const response = await getPlayersList({
        search,
        orderBy,
        orderDirection,
        offset: currentOffset,
        limit,
      })

      const newPlayers = response.data || []

      if (reset) {
        setPlayers(newPlayers)
        setOffset(limit)
      } else {
        setPlayers((prev) => [...prev, ...newPlayers])
        setOffset((prev) => prev + limit)
      }

      // If we get less than limit, no more data
      setHasMore(newPlayers.length === limit)
    } catch (error) {
      console.error('Failed to fetch players:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!loading) {
      fetchPlayers(false)
    }
  }, [loading, offset, search, sortOption])

  useEffect(() => {
    setLoading(true)
    setPlayers([])
    setOffset(0)
    setHasMore(true)
    fetchPlayers(true)
  }, [search, sortOption])

  const handleSortChange = (value: string) => {
    setSortOption(value)
  }

  return (
    <div className=''>
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          <>Danh sách người chơi</>
        </h1>
        <div>
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <Input
              placeholder='Tìm kiếm theo username, họ tên, email, số điện thoại...'
              defaultValue={search}
              onChange={(e) => debouncedSearch(e.target.value)}
              className='flex-1'
            />
            <Select value={sortOption} onValueChange={handleSortChange}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Mới nhất</SelectItem>
                <SelectItem value='oldest'>Cũ nhất</SelectItem>
                <SelectItem value='coin_asc'>Số coin tăng dần</SelectItem>
                <SelectItem value='coin_desc'>Số coin giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className='space-y-2'>
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : (
            <div id='scrollableDiv' className='rounded-md border' style={{ height: '600px', overflow: 'auto' }}>
              <InfiniteScroll
                dataLength={players.length}
                next={loadMore}
                hasMore={hasMore}
                loader={
                  <div className='flex justify-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                }
                endMessage={
                  <div className='text-center py-4 text-sm text-muted-foreground'>
                    {players.length > 0 ? 'Đã hiển thị tất cả người chơi' : 'Không tìm thấy người chơi nào'}
                  </div>
                }
                scrollableTarget='scrollableDiv'>
                <Table>
                  <TableHeader className='sticky top-0 bg-background z-10'>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Tổng nạp</TableHead>
                      <TableHead>Tổng chuyển</TableHead>
                      <TableHead>Số dư</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow
                        key={player.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => router.push(`/players/${player.id}`)}>
                        <TableCell className='font-medium'>{player.username}</TableCell>
                        <TableCell>{player.full_name || '-'}</TableCell>
                        <TableCell>{player.email || '-'}</TableCell>
                        <TableCell>{player.phone || '-'}</TableCell>
                        <TableCell>
                          <div className='flex gap-1 flex-wrap'>
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
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={player.status === 'created' ? 'default' : 'outline'}
                            className='bg-green-500 hover:bg-green-600'>
                            {player.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{player.total_deposit || 0}</TableCell>
                        <TableCell>{player.total_transfer || 0}</TableCell>
                        <TableCell>
                          {player.user_wallets?.[0]?.balance || 0} {player.user_wallets?.[0]?.currency || 'Coin'}
                        </TableCell>
                        <TableCell>
                          {player.dob ? new Date(player.dob).toLocaleDateString('vi-VN') : '-'}
                        </TableCell>
                        <TableCell>
                          {player.created_at ? new Date(player.created_at).toLocaleDateString('vi-VN') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </InfiniteScroll>
            </div>
          )}

          <div className='mt-4 text-sm text-muted-foreground'>Tổng số: {players.length} người chơi</div>
        </div>
      </div>
    </div>
  )
}
