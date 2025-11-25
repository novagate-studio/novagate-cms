'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { debounce } from 'lodash'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { updateGiftCode } from '@/services/giftcode'
import { getEventsList } from '@/services/event'
import { getServersList, Server } from '@/services/game'
import { searchAccounts } from '@/services/player'
import { Check, ChevronsUpDown, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Event } from '@/models/event'
import { Account } from '@/models/player'
import { GiftCode } from '@/models/giftcode'

const giftCodeSchema = z.object({
  code: z.string().optional(),
  usageType: z.number().int().min(1).max(2, {
    message: 'Loại sử dụng phải là 1 (nhiều lần) hoặc 2 (một lần)',
  }),
  totalGiftCodes: z
    .number()
    .int()
    .min(1, {
      message: 'Số lượng phải lớn hơn 0',
    })
    .optional(),
  giftItemDescription: z.string(),
  giftMoneyDescription: z.string(),
  serverId: z.number().int().min(1).optional(),
  userId: z.number().int().min(1).optional(),
  eventId: z.number().int().min(1).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
})

type GiftCodeFormData = z.infer<typeof giftCodeSchema>

interface EditGiftCodeDialogProps {
  giftCode: GiftCode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGiftCodeUpdated: () => void
}

export function EditGiftCodeDialog({ giftCode, open, onOpenChange, onGiftCodeUpdated }: EditGiftCodeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [eventPopoverOpen, setEventPopoverOpen] = useState(false)
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [servers, setServers] = useState<Server[]>([])
  const [serverPopoverOpen, setServerPopoverOpen] = useState(false)
  const [users, setUsers] = useState<Account[]>([])
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<Account | null>(null)

  const form = useForm<GiftCodeFormData>({
    resolver: zodResolver(giftCodeSchema),
    defaultValues: {
      code: '',
      usageType: 1,
      totalGiftCodes: undefined,
      giftItemDescription: '',
      giftMoneyDescription: '',
      serverId: undefined,
      userId: undefined,
      eventId: undefined,
      startTime: undefined,
      endTime: undefined,
    },
  })

  useEffect(() => {
    if (open && giftCode) {
      form.reset({
        code: giftCode.code || '',
        usageType: giftCode.usage_type,
        totalGiftCodes: undefined,
        giftItemDescription: giftCode.gift_item_description || '',
        giftMoneyDescription: giftCode.gift_money_description || '',
        serverId: giftCode.server_id || undefined,
        userId: giftCode.user_id || undefined,
        eventId: giftCode.event_id || undefined,
        startTime: giftCode.start_time ? new Date(giftCode.start_time) : undefined,
        endTime: giftCode.end_time ? new Date(giftCode.end_time) : undefined,
      })
      setSelectedUser((giftCode.user as any) || null)
      setSelectedEvent((giftCode.event as any) || null)
      setEventSearchQuery('')
      fetchEvents('')
      fetchServers()
    }
  }, [open, giftCode])

  const fetchEvents = useCallback(
    debounce(async (search: string) => {
      try {
        const response = await getEventsList({
          search: search || undefined,
          limit: 5,
          orderBy: 'created_at',
          orderDirection: 'desc',
        })
        if (response.code === 200 && response.data) {
          setEvents(response.data)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }, 500),
    []
  )

  useEffect(() => {
    fetchEvents(eventSearchQuery)
  }, [eventSearchQuery, fetchEvents])

  const fetchServers = async () => {
    try {
      const response = await getServersList()
      if (response.code === 200 && response.data) {
        setServers(response.data)
      }
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }

  const debouncedSearchAccounts = useCallback(
    debounce(async (username: string) => {
      if (!username) {
        setUsers([])
        return
      }
      try {
        const response = await searchAccounts(username)
        if (response.code === 200 && response.data) {
          setUsers(response.data)
        }
      } catch (error) {
        console.error('Error searching accounts:', error)
      }
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearchAccounts(userSearchQuery)
  }, [userSearchQuery, debouncedSearchAccounts])

  const onSubmit = async (values: GiftCodeFormData) => {
    if (!giftCode) return

    setIsSubmitting(true)
    try {
      const payload: any = {
        usageType: values.usageType,
        giftItemDescription: values.giftItemDescription,
        giftMoneyDescription: values.giftMoneyDescription,
      }

      if (values.code) {
        payload.code = values.code
      }
      if (values.serverId) {
        payload.serverId = values.serverId
      }
      if (values.eventId) {
        payload.eventId = values.eventId
      }
      if (values.startTime) {
        payload.startTime = values.startTime.getTime().toString()
      }
      if (values.endTime) {
        payload.endTime = values.endTime.getTime().toString()
      }

      if (values.usageType === 2) {
        if (values.userId) {
          payload.userId = values.userId.toString()
        }
      }

      const response = await updateGiftCode(giftCode.id, payload)

      if (response.code === 200 || response.status) {
        toast.success('Cập nhật Gift Code thành công!')
        onOpenChange(false)
        form.reset()
        setSelectedUser(null)
        setSelectedEvent(null)
        setUserSearchQuery('')
        setUsers([])
        onGiftCodeUpdated()
      } else {
        const errorMessage = typeof response.message === 'object' ? response.message.vi : response.message
        toast.error(errorMessage || 'Có lỗi xảy ra khi cập nhật Gift Code')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật Gift Code'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!giftCode) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Gift Code</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã Code <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập mã code' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='usageType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại sử dụng</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1'>Nhiều lần</SelectItem>
                        <SelectItem value='2'>Một lần</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='giftItemDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vật phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder='VD: 1001|1#1002|2' {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='giftMoneyDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiền</FormLabel>
                  <FormControl>
                    <Input placeholder='VD: 5000000|0#5000|3' {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='serverId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>
                      Server <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </FormLabel>
                    <Popover open={serverPopoverOpen} onOpenChange={setServerPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            disabled={isSubmitting}
                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}>
                            <span className='truncate'>
                              {field.value
                                ? servers.find((s) => s.id === field.value)?.name || `Server #${field.value}`
                                : 'Chọn server'}
                            </span>
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[400px] p-0'>
                        <Command>
                          <CommandInput placeholder='Tìm kiếm server...' />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy server</CommandEmpty>
                            <CommandGroup>
                              {servers.map((server) => (
                                <CommandItem
                                  key={server.id}
                                  value={`${server.name} ${server.id}`}
                                  onSelect={() => {
                                    field.onChange(server.id)
                                    setServerPopoverOpen(false)
                                  }}
                                  className='flex items-center gap-2'>
                                  <Check
                                    className={cn(
                                      'h-4 w-4 shrink-0',
                                      server.id === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className='flex flex-col overflow-hidden'>
                                    <span className='truncate'>{server.name}</span>
                                    <span className='text-xs text-muted-foreground'>ID: {server.id}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='eventId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>
                      Sự kiện <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </FormLabel>
                    <Popover open={eventPopoverOpen} onOpenChange={setEventPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            disabled={isSubmitting}
                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}>
                            <span className='truncate'>
                              {field.value ? selectedEvent?.title || `Event #${field.value}` : 'Chọn sự kiện'}
                            </span>
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[400px] p-0'>
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder='Tìm kiếm sự kiện...'
                            value={eventSearchQuery}
                            onValueChange={setEventSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy sự kiện</CommandEmpty>
                            <CommandGroup>
                              {events.map((event) => (
                                <CommandItem
                                  key={event.id}
                                  value={`${event.title} ${event.id}`}
                                  onSelect={() => {
                                    field.onChange(event.id)
                                    setSelectedEvent(event)
                                    setEventSearchQuery('')
                                    setEventPopoverOpen(false)
                                  }}
                                  className='flex items-center gap-2'>
                                  <Check
                                    className={cn(
                                      'h-4 w-4 shrink-0',
                                      event.id === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className='flex flex-col overflow-hidden'>
                                    <span className='truncate'>{event.title}</span>
                                    <span className='text-xs text-muted-foreground'>ID: {event.id}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('usageType') === 2 && (
                <FormField
                  control={form.control}
                  name='userId'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>
                        User <span className='text-muted-foreground'>(Tùy chọn)</span>
                      </FormLabel>
                      <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              role='combobox'
                              disabled={isSubmitting}
                              className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}>
                              <span className='truncate'>
                                {field.value
                                  ? selectedUser?.userName || (selectedUser as any)?.user_name || `User #${field.value}`
                                  : 'Chọn user'}
                              </span>
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-[400px] p-0'>
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder='Tìm kiếm user...'
                              value={userSearchQuery}
                              onValueChange={setUserSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {userSearchQuery ? 'Không tìm thấy user' : 'Nhập để tìm kiếm user'}
                              </CommandEmpty>
                              <CommandGroup>
                                {users.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={`${user.userName} ${user.id}`}
                                    onSelect={() => {
                                      field.onChange(user.id)
                                      setSelectedUser(user)
                                      setUserPopoverOpen(false)
                                    }}
                                    className='flex items-center gap-2'>
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        user.id === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className='flex flex-col overflow-hidden'>
                                      <span className='truncate'>{user.userName}</span>
                                      <span className='text-xs text-muted-foreground'>ID: {user.id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>
                      Thời gian bắt đầu <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            disabled={isSubmitting}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? format(field.value, 'PPP HH:mm', { locale: vi }) : 'Chọn ngày giờ'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                        {field.value && (
                          <div className='p-3 border-t'>
                            <Input
                              type='time'
                              value={field.value ? format(field.value, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = field.value ? new Date(field.value) : new Date()
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }}
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endTime'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>
                      Thời gian kết thúc <span className='text-muted-foreground'>(Tùy chọn)</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            disabled={isSubmitting}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {field.value ? format(field.value, 'PPP HH:mm', { locale: vi }) : 'Chọn ngày giờ'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                        {field.value && (
                          <div className='p-3 border-t'>
                            <Input
                              type='time'
                              value={field.value ? format(field.value, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':')
                                const newDate = field.value ? new Date(field.value) : new Date()
                                newDate.setHours(parseInt(hours), parseInt(minutes))
                                field.onChange(newDate)
                              }}
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Gift Code'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
