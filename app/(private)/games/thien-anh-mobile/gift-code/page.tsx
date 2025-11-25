'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GiftCode } from '@/models/giftcode'
import { bulkDeleteGiftCodes, getGiftCodesList } from '@/services/giftcode'
import { adminAxiosInstance } from '@/services/axios'
import { Server, getServersList } from '@/services/game'
import { searchAccounts } from '@/services/player'
import { getEventsList } from '@/services/event'
import { Account } from '@/models/player'
import { Event } from '@/models/event'
import { format } from 'date-fns'
import { debounce, set } from 'lodash'
import {
  Check,
  Copy,
  Filter,
  Loader,
  Search,
  Trash2,
  ChevronsUpDown,
  CalendarIcon,
  FileDown,
  Pencil,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'
import { CreateGiftCodeDialog } from './components/create-giftcode-dialog'
import { DeleteGiftCodeDialog } from './components/delete-giftcode-dialog'
import { GiftCodeDetailDialog } from './components/giftcode-detail-dialog'
import { EditGiftCodeDialog } from './components/edit-giftcode-dialog'
import { cn } from '@/lib/utils'
const LIMIT = 50
export default function GiftCodePage() {
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('id_desc')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deletingGiftCode, setDeletingGiftCode] = useState<{ id: number; code: string } | null>(null)
  const [editingGiftCode, setEditingGiftCode] = useState<GiftCode | null>(null)
  const [selectedGiftCode, setSelectedGiftCode] = useState<GiftCode | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const defaultFilter = {
    code: '',
    giftItemDescription: '',
    giftMoneyDescription: '',
    usageType: 0,
    serverId: 0,
    userId: 0,
    eventId: 0,
    adminId: 0,
    startTime: '',
    endTime: '',
  }
  const [filter, setFilter] = useState(defaultFilter)
  const [codeFilter, setCodeFilter] = useState('')
  const [giftItemDescriptionFilter, setGiftItemDescriptionFilter] = useState('')
  const [giftMoneyDescriptionFilter, setGiftMoneyDescriptionFilter] = useState('')
  const [usageTypeFilter, setUsageTypeFilter] = useState(0)
  const [adminIdFilter, setAdminIdFilter] = useState('')
  const [servers, setServers] = useState<Server[]>([])
  const [serverSearchQuery, setServerSearchQuery] = useState('')
  const [selectedServerId, setSelectedServerId] = useState(0)
  const [isLoadingServers, setIsLoadingServers] = useState(false)
  const [users, setUsers] = useState<Account[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(0)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(0)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [startTimeFilter, setStartTimeFilter] = useState<Date | undefined>(undefined)
  const [endTimeFilter, setEndTimeFilter] = useState<Date | undefined>(undefined)

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
          limit: LIMIT,
          code: filter.code || undefined,
          giftItemDescription: filter.giftItemDescription || undefined,
          giftMoneyDescription: filter.giftMoneyDescription || undefined,
          usageType: filter.usageType || undefined,
          serverId: filter.serverId || undefined,
          userId: filter.userId || undefined,
          eventId: filter.eventId || undefined,
          adminId: filter.adminId || undefined,
          startTime: filter.startTime || undefined,
          endTime: filter.endTime || undefined,
        })

        if (response.code === 200 && response.data) {
          const newGiftCodes = response.data || []
          setGiftCodes((prev) => (isNewSearch ? newGiftCodes : [...prev, ...newGiftCodes]))
          setHasMore(newGiftCodes.length === LIMIT)
        }
      } catch (error) {
        console.error('Error fetching gift codes:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [search, sort, JSON.stringify(filter)]
  )

  const debouncedFetchGiftCodes = useMemo(() => debounce(() => fetchGiftCodes(0, true), 500), [fetchGiftCodes])

  const fetchServers = useCallback(async () => {
    setIsLoadingServers(true)
    try {
      const response = await getServersList()
      if (response.code === 200 && response.data) {
        setServers(response.data)
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    } finally {
      setIsLoadingServers(false)
    }
  }, [])

  const filteredServers = useMemo(() => {
    if (!serverSearchQuery) return servers
    return servers.filter((server) => server.name.toLowerCase().includes(serverSearchQuery.toLowerCase()))
  }, [servers, serverSearchQuery])

  const fetchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setUsers([])
      return
    }
    setIsLoadingUsers(true)
    try {
      const response = await searchAccounts(searchQuery)
      if (response.code === 200 && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  const debouncedFetchUsers = useMemo(() => debounce((query: string) => fetchUsers(query), 500), [fetchUsers])

  useEffect(() => {
    debouncedFetchUsers(userSearchQuery)
    return () => {
      debouncedFetchUsers.cancel()
    }
  }, [userSearchQuery, debouncedFetchUsers])

  const fetchEvents = useCallback(async (searchQuery: string) => {
    setIsLoadingEvents(true)
    try {
      const response = await getEventsList({
        search: searchQuery || undefined,
        limit: 50,
        orderBy: 'created_at',
        orderDirection: 'desc',
      })
      if (response.code === 200 && response.data) {
        setEvents(response.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [])

  const debouncedFetchEvents = useMemo(() => debounce((query: string) => fetchEvents(query), 500), [fetchEvents])

  useEffect(() => {
    debouncedFetchEvents(eventSearchQuery)
    return () => {
      debouncedFetchEvents.cancel()
    }
  }, [eventSearchQuery, debouncedFetchEvents])

  useEffect(() => {
    setIsLoading(true)
    debouncedFetchGiftCodes()
    return () => {
      debouncedFetchGiftCodes.cancel()
    }
  }, [search, sort, JSON.stringify(filter), debouncedFetchGiftCodes])

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

  const handleGiftCodeUpdated = () => {
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(giftCodes.map((gc) => gc.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }

  const confirmBulkDelete = async () => {
    setShowBulkDeleteDialog(false)
    setIsBulkDeleting(true)
    try {
      const response = await bulkDeleteGiftCodes(selectedIds)
      if (response.code === 200 || response.status) {
        toast.success(`Đã xóa ${selectedIds.length} gift code thành công!`)
        setSelectedIds([])
        handleGiftCodeDeleted()
      } else {
        const errorMessage = typeof response.message === 'object' ? response.message.vi : response.message
        toast.error(errorMessage || 'Có lỗi xảy ra khi xóa gift code')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi xóa gift code'
      toast.error(errorMessage)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      const { orderBy, orderDirection } = getSortParams(sort)
      const params = {
        search: search || undefined,
        orderBy,
        orderDirection,
        code: filter.code || undefined,
        giftItemDescription: filter.giftItemDescription || undefined,
        giftMoneyDescription: filter.giftMoneyDescription || undefined,
        usageType: filter.usageType || undefined,
        serverId: filter.serverId || undefined,
        userId: filter.userId || undefined,
        eventId: filter.eventId || undefined,
        adminId: filter.adminId || undefined,
        startTime: filter.startTime || undefined,
        endTime: filter.endTime || undefined,
      }

      const response = await adminAxiosInstance.get('/api/v2/giftcodes/thien-anh/export', {
        params,
        responseType: 'blob',
      })

      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `giftcodes_${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Đang tải xuống file Excel...')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi xuất Excel'
      toast.error(errorMessage)
    }
  }

  const resetFilter = () => {
    setFilter(defaultFilter)
    setSearch('')
    setSort('id_desc')
    setCodeFilter('')
    setUsageTypeFilter(0)
    setGiftItemDescriptionFilter('')
    setGiftMoneyDescriptionFilter('')
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Gift Code</h1>
          {selectedIds.length > 0 && (
            <p className='text-sm text-muted-foreground mt-1'>Đã chọn {selectedIds.length} gift code</p>
          )}
        </div>
        <div className='flex gap-2'>
          {selectedIds.length > 0 && (
            <Button variant='destructive' onClick={() => setShowBulkDeleteDialog(true)} disabled={isBulkDeleting}>
              <Trash2 className='h-4 w-4 mr-2' />
              {isBulkDeleting ? 'Đang xóa...' : `Xóa ${selectedIds.length} mục`}
            </Button>
          )}
          <Button variant='outline' onClick={handleExportExcel}>
            <FileDown className='h-4 w-4 mr-2' />
            Xuất Excel
          </Button>
          <CreateGiftCodeDialog onGiftCodeCreated={handleGiftCodeCreated} />
        </div>
      </div>

      <Card className={cn(isLoading && 'cursor-wait')}>
        <CardHeader className='flex justify-between'>
          <CardTitle>Danh sách Gift Code</CardTitle>
          {Object.entries(filter).filter(([key, value]) => !!value).length > 0 && (
            <Button size={'sm'} onClick={() => resetFilter()} className='' variant={'destructive'}>
              Xóa bộ lọc
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo mã code, mô tả vật phẩm hoặc coin...'
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
          <InfiniteScroll
            dataLength={giftCodes.length}
            next={fetchMoreGiftCodes}
            hasMore={hasMore}
            loader={
              <div className='flex justify-center py-4'>
                <Loader className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            }
            endMessage={<p className='text-center text-muted-foreground py-4 text-sm'>Đã hiển thị tất cả Gift Code</p>}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={selectedIds.length === giftCodes.length && giftCodes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between'>
                          <div>Mã Code</div>
                          {filter.code ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo mã code</div>
                        <Input
                          placeholder='Nhập mã code'
                          value={codeFilter}
                          onChange={(e) => setCodeFilter(e.target.value)}
                        />
                        <div className='flex gap-2 justify-end'>
                          {filter.code && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setCodeFilter('')
                                setFilter({ ...filter, code: '' })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button size={'sm'} onClick={() => setFilter({ ...filter, code: codeFilter })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between'>
                          <div>Loại </div>
                          {filter.usageType ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo loại</div>
                        <div className='flex gap-2'>
                          <Badge
                            variant={usageTypeFilter == 1 ? 'default' : 'outline'}
                            className={cn(usageTypeFilter == 1 && 'bg-green-700 text-white')}
                            onClick={() => setUsageTypeFilter(1)}>
                            Nhiều lần
                          </Badge>
                          <Badge
                            variant={usageTypeFilter == 2 ? 'default' : 'outline'}
                            className={cn(usageTypeFilter == 2 && 'bg-green-700 text-white')}
                            onClick={() => setUsageTypeFilter(2)}>
                            Một lần
                          </Badge>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          {!!filter.usageType && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setUsageTypeFilter(0)
                                setFilter({ ...filter, usageType: 0 })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button size={'sm'} onClick={() => setFilter({ ...filter, usageType: usageTypeFilter })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between'>
                          <div>Vật phẩm</div>
                          {filter.giftItemDescription ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo vật phẩm</div>
                        <Input
                          placeholder='Nhập mô tả vật phẩm'
                          value={giftItemDescriptionFilter}
                          onChange={(e) => setGiftItemDescriptionFilter(e.target.value)}
                        />
                        <div className='flex gap-2 justify-end'>
                          {filter.giftItemDescription && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setGiftItemDescriptionFilter('')
                                setFilter({ ...filter, giftItemDescription: '' })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button
                            size={'sm'}
                            onClick={() => setFilter({ ...filter, giftItemDescription: giftItemDescriptionFilter })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between'>
                          <div>Tiền</div>
                          {filter.giftMoneyDescription ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo coin</div>
                        <Input
                          placeholder='Nhập mô tả coin'
                          value={giftMoneyDescriptionFilter}
                          onChange={(e) => setGiftMoneyDescriptionFilter(e.target.value)}
                        />
                        <div className='flex gap-2 justify-end'>
                          {filter.giftMoneyDescription && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setGiftMoneyDescriptionFilter('')
                                setFilter({ ...filter, giftMoneyDescription: '' })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button
                            size={'sm'}
                            onClick={() => setFilter({ ...filter, giftMoneyDescription: giftMoneyDescriptionFilter })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (open && servers.length === 0) {
                        fetchServers()
                      }
                    }}>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between cursor-pointer'>
                          <div>Server</div>
                          {filter.serverId ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[300px]'>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo server</div>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder='Tìm kiếm server...'
                            value={serverSearchQuery}
                            onValueChange={setServerSearchQuery}
                          />
                          <CommandList>
                            {isLoadingServers ? (
                              <div className='py-6 text-center text-sm'>
                                <Loader className='h-4 w-4 animate-spin mx-auto' />
                              </div>
                            ) : filteredServers.length === 0 ? (
                              <CommandEmpty>Không tìm thấy server</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {filteredServers.map((server) => (
                                  <CommandItem
                                    key={server.id}
                                    value={server.id.toString()}
                                    onSelect={() => setSelectedServerId(server.id)}
                                    className='flex items-center gap-2'>
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        selectedServerId === server.id ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className='flex flex-col overflow-hidden'>
                                      <span className='truncate'>{server.name}</span>
                                      <span className='text-xs text-muted-foreground'>ID: {server.id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                        <div className='flex gap-2 justify-end'>
                          {!!filter.serverId && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setSelectedServerId(0)
                                setServerSearchQuery('')
                                setFilter({ ...filter, serverId: 0 })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button size={'sm'} onClick={() => setFilter({ ...filter, serverId: selectedServerId })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (open) {
                        setUserSearchQuery('')
                        setUsers([])
                      }
                    }}>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between cursor-pointer'>
                          <div>Người dùng</div>
                          {filter.userId ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[300px]'>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo người dùng</div>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder='Tìm kiếm người dùng (tối thiểu 2 ký tự)...'
                            value={userSearchQuery}
                            onValueChange={setUserSearchQuery}
                          />
                          <CommandList>
                            {isLoadingUsers ? (
                              <div className='py-6 text-center text-sm'>
                                <Loader className='h-4 w-4 animate-spin mx-auto' />
                              </div>
                            ) : users.length === 0 ? (
                              <CommandEmpty>
                                {userSearchQuery.length < 2
                                  ? 'Nhập ít nhất 2 ký tự để tìm kiếm'
                                  : 'Không tìm thấy người dùng'}
                              </CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {users.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={user.id.toString()}
                                    onSelect={() => setSelectedUserId(user.id)}
                                    className='flex items-center gap-2'>
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className='flex flex-col overflow-hidden'>
                                      <span className='truncate'>{user.userName}</span>
                                      <span className='text-xs text-muted-foreground'>ID: {user.id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                        <div className='flex gap-2 justify-end'>
                          {!!filter.userId && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setSelectedUserId(0)
                                setUserSearchQuery('')
                                setUsers([])
                                setFilter({ ...filter, userId: 0 })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button size={'sm'} onClick={() => setFilter({ ...filter, userId: selectedUserId })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between'>
                          <div>Admin</div>
                          {filter.adminId ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo admin</div>
                        <Input
                          placeholder='Nhập admin ID'
                          value={adminIdFilter}
                          onChange={(e) => setAdminIdFilter(e.target.value)}
                        />
                        <div className='flex gap-2 justify-end'>
                          {!!filter.adminId && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setAdminIdFilter('')
                                setFilter({ ...filter, adminId: 0 })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button
                            size={'sm'}
                            onClick={() =>
                              setFilter({ ...filter, adminId: adminIdFilter ? parseInt(adminIdFilter) : 0 })
                            }>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu
                    onOpenChange={(open) => {
                      if (open) {
                        fetchEvents('')
                      }
                    }}>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between cursor-pointer'>
                          <div>Sự kiện</div>
                          {filter.eventId ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[300px]'>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo sự kiện</div>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder='Tìm kiếm sự kiện...'
                            value={eventSearchQuery}
                            onValueChange={setEventSearchQuery}
                          />
                          <CommandList>
                            {isLoadingEvents ? (
                              <div className='py-6 text-center text-sm'>
                                <Loader className='h-4 w-4 animate-spin mx-auto' />
                              </div>
                            ) : events.length === 0 ? (
                              <CommandEmpty>Không tìm thấy sự kiện</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {events.map((event) => (
                                  <CommandItem
                                    key={event.id}
                                    value={event.id.toString()}
                                    onSelect={() => setSelectedEventId(event.id)}
                                    className='flex items-center gap-2'>
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        selectedEventId === event.id ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className='flex flex-col overflow-hidden'>
                                      <span className='truncate'>{event.title}</span>
                                      <span className='text-xs text-muted-foreground'>ID: {event.id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                        <div className='flex gap-2 justify-end'>
                          {!!filter.eventId && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setSelectedEventId(0)
                                setEventSearchQuery('')
                                setFilter({ ...filter, eventId: 0 })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button size={'sm'} onClick={() => setFilter({ ...filter, eventId: selectedEventId })}>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between cursor-pointer'>
                          <div>Bắt đầu</div>
                          {filter.startTime ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-auto'>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo thời gian bắt đầu</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-60 justify-start text-left font-normal',
                                !startTimeFilter && 'text-muted-foreground'
                              )}>
                              <CalendarIcon className='mr-2 h-4 w-4' />
                              {startTimeFilter ? format(startTimeFilter, 'PPP HH:mm') : 'Chọn ngày giờ'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={startTimeFilter}
                              onSelect={setStartTimeFilter}
                              initialFocus
                            />
                            {startTimeFilter && (
                              <div className='p-3 border-t'>
                                <Input
                                  type='time'
                                  value={startTimeFilter ? format(startTimeFilter, 'HH:mm') : ''}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':')
                                    const newDate = startTimeFilter ? new Date(startTimeFilter) : new Date()
                                    newDate.setHours(parseInt(hours), parseInt(minutes))
                                    setStartTimeFilter(newDate)
                                  }}
                                />
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                        <div className='flex gap-2 justify-end'>
                          {filter.startTime && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setStartTimeFilter(undefined)
                                setFilter({ ...filter, startTime: '' })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button
                            size={'sm'}
                            onClick={() =>
                              setFilter({
                                ...filter,
                                startTime: startTimeFilter ? startTimeFilter.getTime().toString() : '',
                              })
                            }>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TableHead>
                        <div className='flex items-center justify-between cursor-pointer'>
                          <div>Kết thúc</div>
                          {filter.endTime ? (
                            <Filter fill='black' className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Filter className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableHead>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-auto'>
                      <div className='space-y-3 p-3'>
                        <div className='font-semibold text-sm'>Filter theo thời gian kết thúc</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-60 justify-start text-left font-normal',
                                !endTimeFilter && 'text-muted-foreground'
                              )}>
                              <CalendarIcon className='mr-2 h-4 w-4' />
                              {endTimeFilter ? format(endTimeFilter, 'PPP HH:mm') : 'Chọn ngày giờ'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar mode='single' selected={endTimeFilter} onSelect={setEndTimeFilter} initialFocus />
                            {endTimeFilter && (
                              <div className='p-3 border-t'>
                                <Input
                                  type='time'
                                  value={endTimeFilter ? format(endTimeFilter, 'HH:mm') : ''}
                                  onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':')
                                    const newDate = endTimeFilter ? new Date(endTimeFilter) : new Date()
                                    newDate.setHours(parseInt(hours), parseInt(minutes))
                                    setEndTimeFilter(newDate)
                                  }}
                                />
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                        <div className='flex gap-2 justify-end'>
                          {filter.endTime && (
                            <Button
                              variant='outline'
                              size={'sm'}
                              onClick={() => {
                                setEndTimeFilter(undefined)
                                setFilter({ ...filter, endTime: '' })
                              }}>
                              Xóa
                            </Button>
                          )}
                          <Button
                            size={'sm'}
                            onClick={() =>
                              setFilter({
                                ...filter,
                                endTime: endTimeFilter ? endTimeFilter.getTime().toString() : '',
                              })
                            }>
                            Áp dụng
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(giftCode.id)}
                        onCheckedChange={(checked: boolean) => handleSelectOne(giftCode.id, checked)}
                      />
                    </TableCell>
                    <TableCell className=''>{giftCode.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold uppercase'>{giftCode.code}</span>
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
                      {giftCode.server ? (
                        <div>
                          <div className='font-medium'>{giftCode.server.name}</div>
                          <div className='text-xs text-muted-foreground'>ID: {giftCode.server.id}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
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
                    <TableCell>
                      {giftCode.start_time ? format(new Date(giftCode.start_time), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {giftCode.end_time ? format(new Date(giftCode.end_time), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>{format(new Date(giftCode.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingGiftCode(giftCode)
                          }}
                          title='Chỉnh sử'>
                          <Pencil className='h-4 w-4 text-blue-600' />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfiniteScroll>
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

      <EditGiftCodeDialog
        giftCode={editingGiftCode}
        open={!!editingGiftCode}
        onOpenChange={(open) => !open && setEditingGiftCode(null)}
        onGiftCodeUpdated={handleGiftCodeUpdated}
      />

      <GiftCodeDetailDialog
        giftCode={selectedGiftCode}
        open={!!selectedGiftCode}
        onOpenChange={(open) => !open && setSelectedGiftCode(null)}
      />

      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa nhiều Gift Code</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {selectedIds.length} gift code đã chọn? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowBulkDeleteDialog(false)} disabled={isBulkDeleting}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={confirmBulkDelete} disabled={isBulkDeleting}>
              {isBulkDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
