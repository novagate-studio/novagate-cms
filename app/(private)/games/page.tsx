'use client'

import { useEffect, useState } from 'react'
import { getGamesList, Game } from '@/services/game'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 10

  const fetchGames = async (offsetValue: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true)
      const response = await getGamesList({
        offset: offsetValue,
        limit,
      })
      
      if (isLoadMore) {
        setGames((prev) => [...prev, ...response.data])
      } else {
        setGames(response.data)
      }
      
      setHasMore(response.data.length === limit)
    } catch (err) {
      console.error('Failed to fetch games:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames(0, false)
  }, [])

  const loadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)
    fetchGames(newOffset, true)
  }

  if (loading && games.length === 0) {
    return (
      <div className='space-y-6'>
        <h1 className='text-3xl font-bold'>Danh sách game</h1>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-48 w-full' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-6 w-full mb-2' />
                <Skeleton className='h-4 w-2/3' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Danh sách game</h1>

      <InfiniteScroll
        dataLength={games.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className='py-4 text-center'>
            <Skeleton className='h-10 w-full' />
          </div>
        }
        endMessage={
          <p className='py-4 text-center text-sm text-muted-foreground'>
            {games.length === 0 ? 'Không có game nào' : 'Đã tải hết dữ liệu'}
          </p>
        }>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {games.map((game) => (
            <Card key={game.id} className='overflow-hidden hover:shadow-lg transition-shadow pt-0'>
              <div className='aspect-video relative bg-muted'>
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                    No Image
                  </div>
                )}
              </div>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <CardTitle className='text-xl'>{game.name}</CardTitle>
                  <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                    {game.status === 'active' ? 'Hoạt động' : game.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div>
                    <p className='text-sm text-muted-foreground'>ID</p>
                    <p className='font-medium'>#{game.id}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Tiền tệ trong game</p>
                    <p className='font-medium'>{game.ingame_currency_name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Ngày tạo</p>
                    <p className='font-medium'>{format(new Date(game.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Ngày cập nhật</p>
                    <p className='font-medium'>{format(new Date(game.updated_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}
