'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Event } from '@/models/event'
import { getEventsList } from '@/services/event'
import { debounce } from 'lodash'
import { Search, Pencil, Trash2 } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { format } from 'date-fns'
import { CreateEventDialog } from './components/create-event-dialog'
import { EditEventDialog } from './components/edit-event-dialog'
import { DeleteEventDialog } from './components/delete-event-dialog'

export default function SuKienPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at_desc')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<{ id: number; title: string } | null>(null)

  const getSortParams = (sortValue: string) => {
    if (sortValue.startsWith('created_at_')) {
      const direction = sortValue.split('_')[2]
      return {
        orderBy: 'created_at',
        orderDirection: direction || 'desc',
      }
    }
    const [field, direction] = sortValue.split('_')
    return {
      orderBy: field,
      orderDirection: direction || 'desc',
    }
  }

  const fetchEvents = useCallback(
    async (offset = 0, isNewSearch = false) => {
      try {
        const { orderBy, orderDirection } = getSortParams(sort)
        const response = await getEventsList({
          search: search || undefined,
          orderBy,
          orderDirection,
          offset,
          limit: 20,
        })

        if (response.code === 200 && response.data) {
          const newEvents = response.data || []
          setEvents((prev) => (isNewSearch ? newEvents : [...prev, ...newEvents]))
          setHasMore(newEvents.length === 20)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [search, sort]
  )

  const debouncedFetchEvents = useMemo(() => debounce(() => fetchEvents(0, true), 500), [fetchEvents])

  useEffect(() => {
    setIsLoading(true)
    setEvents([])
    debouncedFetchEvents()
    return () => {
      debouncedFetchEvents.cancel()
    }
  }, [search, sort, debouncedFetchEvents])

  const fetchMoreEvents = () => {
    fetchEvents(events.length, false)
  }

  const handleEventCreated = () => {
    setIsLoading(true)
    setEvents([])
    fetchEvents(0, true)
  }

  const handleEventUpdated = () => {
    setIsLoading(true)
    setEvents([])
    fetchEvents(0, true)
  }

  const handleEventDeleted = () => {
    setIsLoading(true)
    setEvents([])
    fetchEvents(0, true)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Sự kiện</h1>
        </div>
        <CreateEventDialog onEventCreated={handleEventCreated} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo tên hoặc mô tả...'
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
                <SelectItem value='title_asc'>Tên A-Z</SelectItem>
                <SelectItem value='title_desc'>Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>Không tìm thấy sự kiện nào</div>
          ) : (
            <InfiniteScroll
              dataLength={events.length}
              next={fetchMoreEvents}
              hasMore={hasMore}
              loader={
                <div className='space-y-2 mt-2'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              }
              endMessage={
                <p className='text-center text-muted-foreground py-4 text-sm'>Đã hiển thị tất cả sự kiện</p>
              }>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên sự kiện</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Số lượng Gift Code</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className='font-medium'>{event.id}</TableCell>
                      <TableCell>{event.title}</TableCell>
                      <TableCell className='max-w-md truncate'>{event.description}</TableCell>
                      <TableCell>{event.gift_codes_count}</TableCell>
                      <TableCell>{format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{format(new Date(event.updated_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditingEvent(event)}
                            title='Chỉnh sửa'>
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeletingEvent({ id: event.id, title: event.title })}
                            title='Xóa'>
                            <Trash2 className='h-4 w-4 text-red-600' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {deletingEvent && (
        <DeleteEventDialog
          eventId={deletingEvent.id}
          eventTitle={deletingEvent.title}
          open={!!deletingEvent}
          onOpenChange={(open) => !open && setDeletingEvent(null)}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  )
}
