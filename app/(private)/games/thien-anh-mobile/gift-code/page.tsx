'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { GiftCode } from '@/models/giftcode'
import { getGiftCodesList } from '@/services/giftcode'
import { debounce } from 'lodash'
import { Search, Copy, Check, Trash2 } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CreateGiftCodeDialog } from './components/create-giftcode-dialog'
import { DeleteGiftCodeDialog } from './components/delete-giftcode-dialog'
import { GiftCodeDetailDialog } from './components/giftcode-detail-dialog'

export default function GiftCodePage() {
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('id_desc')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deletingGiftCode, setDeletingGiftCode] = useState<{ id: number; code: string } | null>(null)
  const [selectedGiftCode, setSelectedGiftCode] = useState<GiftCode | null>(null)

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

  const fetchGiftCodes = useCallback(
    async (offset = 0, isNewSearch = false) => {
      try {
        const { orderBy, orderDirection } = getSortParams(sort)
        const response = await getGiftCodesList({
          search: search || undefined,
          orderBy,
          orderDirection,
          offset,
          limit: 20,
        })

        if (response.code === 200 && response.data) {
          const newGiftCodes = response.data || []
          setGiftCodes((prev) => (isNewSearch ? newGiftCodes : [...prev, ...newGiftCodes]))
          setHasMore(newGiftCodes.length === 20)
        }
      } catch (error) {
        console.error('Error fetching gift codes:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [search, sort]
  )

  const debouncedFetchGiftCodes = useMemo(() => debounce(() => fetchGiftCodes(0, true), 500), [fetchGiftCodes])

  useEffect(() => {
    setIsLoading(true)
    setGiftCodes([])
    debouncedFetchGiftCodes()
    return () => {
      debouncedFetchGiftCodes.cancel()
    }
  }, [search, sort, debouncedFetchGiftCodes])

  const fetchMoreGiftCodes = () => {
    fetchGiftCodes(giftCodes.length, false)
  }

  const handleGiftCodeCreated = () => {
    setIsLoading(true)
    setGiftCodes([])
    fetchGiftCodes(0, true)
  }

  const handleGiftCodeDeleted = () => {
    setIsLoading(true)
    setGiftCodes([])
    fetchGiftCodes(0, true)
  }

  const getUsageTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge variant='default'>Nhiều lần</Badge>
      case 2:
        return <Badge variant='secondary'>Một lần</Badge>
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Đã sao chép mã code!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error('Không thể sao chép mã code')
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Gift Code</h1>
        </div>
        <CreateGiftCodeDialog onGiftCodeCreated={handleGiftCodeCreated} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Gift Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo mã code, mô tả vật phẩm hoặc tiền...'
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
                <SelectItem value='id_desc'>Mới nhất</SelectItem>
                <SelectItem value='id_asc'>Cũ nhất</SelectItem>
                <SelectItem value='code_asc'>Mã A-Z</SelectItem>
                <SelectItem value='code_desc'>Mã Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className='space-y-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : giftCodes.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>Không tìm thấy Gift Code nào</div>
          ) : (
            <InfiniteScroll
              dataLength={giftCodes.length}
              next={fetchMoreGiftCodes}
              hasMore={hasMore}
              loader={
                <div className='space-y-2 mt-2'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              }
              endMessage={
                <p className='text-center text-muted-foreground py-4 text-sm'>Đã hiển thị tất cả Gift Code</p>
              }>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Mã Code</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Vật phẩm</TableHead>
                    <TableHead>Tiền</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Sự kiện</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftCodes.map((giftCode) => (
                    <TableRow
                      key={giftCode.id}
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => setSelectedGiftCode(giftCode)}>
                      <TableCell className='font-medium'>{giftCode.id}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono'>{giftCode.code}</span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyCode(giftCode.code)
                            }}
                            title='Sao chép mã'>
                            {copiedCode === giftCode.code ? (
                              <Check className='h-3 w-3 text-green-600' />
                            ) : (
                              <Copy className='h-3 w-3' />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getUsageTypeBadge(giftCode.usage_type)}</TableCell>
                      <TableCell className='max-w-xs truncate'>{giftCode.gift_item_description || '-'}</TableCell>
                      <TableCell className='max-w-xs truncate'>{giftCode.gift_money_description || '-'}</TableCell>
                      <TableCell>
                        {giftCode.user ? (
                          <div>
                            <div className='font-medium'>{giftCode.user.user_name}</div>
                            <div className='text-xs text-muted-foreground'>ID: {giftCode.user.id}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {giftCode.admin && (
                          <div>
                            <div className='font-medium'>{giftCode.admin.user_name}</div>
                            <div className='text-xs text-muted-foreground'>ID: {giftCode.admin.id}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {giftCode.event ? (
                          <div>
                            <div className='font-medium'>{giftCode.event.title}</div>
                            <div className='text-xs text-muted-foreground'>ID: {giftCode.event.id}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(giftCode.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingGiftCode({ id: giftCode.id, code: giftCode.code })
                          }}
                          title='Xóa'>
                          <Trash2 className='h-4 w-4 text-red-600' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {deletingGiftCode && (
        <DeleteGiftCodeDialog
          giftCodeId={deletingGiftCode.id}
          giftCodeCode={deletingGiftCode.code}
          open={!!deletingGiftCode}
          onOpenChange={(open) => !open && setDeletingGiftCode(null)}
          onGiftCodeDeleted={handleGiftCodeDeleted}
        />
      )}

      <GiftCodeDetailDialog
        giftCode={selectedGiftCode}
        open={!!selectedGiftCode}
        onOpenChange={(open) => !open && setSelectedGiftCode(null)}
      />
    </div>
  )
}
