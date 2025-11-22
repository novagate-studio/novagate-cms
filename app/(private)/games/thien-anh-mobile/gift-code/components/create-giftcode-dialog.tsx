'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { createGiftCode } from '@/services/giftcode'
import { getEventsList } from '@/services/event'
import { Plus, Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Event } from '@/models/event'

const giftCodeSchema = z.object({
  code: z.string().min(1, {
    message: 'Mã code không được để trống',
  }),
  usageType: z.number().int().min(1).max(2, {
    message: 'Loại sử dụng phải là 1 (nhiều lần) hoặc 2 (một lần)',
  }),
  totalGiftCodes: z.number().int().min(1, {
    message: 'Số lượng phải lớn hơn 0',
  }),
  giftItemDescription: z.string(),
  giftMoneyDescription: z.string(),
  serverId: z.number().int().min(1),
  userId: z.number().int().min(1),
  eventId: z.number().int().min(1),
})

type GiftCodeFormData = z.infer<typeof giftCodeSchema>

interface CreateGiftCodeDialogProps {
  onGiftCodeCreated: () => void
}

export function CreateGiftCodeDialog({ onGiftCodeCreated }: CreateGiftCodeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [eventPopoverOpen, setEventPopoverOpen] = useState(false)

  const form = useForm<GiftCodeFormData>({
    resolver: zodResolver(giftCodeSchema),
    defaultValues: {
      code: '',
      usageType: 1,
      totalGiftCodes: 1,
      giftItemDescription: '',
      giftMoneyDescription: '',
      serverId: 1,
      userId: 1,
      eventId: 1,
    },
  })

  useEffect(() => {
    if (open) {
      fetchEvents()
    }
  }, [open])

  const fetchEvents = async () => {
    try {
      const response = await getEventsList({ limit: 1000, orderBy: 'created_at', orderDirection: 'desc' })
      if (response.code === 200 && response.data) {
        setEvents(response.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  async function onSubmit(values: GiftCodeFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await createGiftCode({
        ...values,
        userId: values.userId.toString(),
      })

      if (response.code === 201 || response.status) {
        toast.success('Tạo Gift Code thành công!')
        setOpen(false)
        form.reset()
        onGiftCodeCreated()
      } else {
        const errorMessage = typeof response.message === 'object' ? response.message.vi : response.message
        toast.error(errorMessage || 'Có lỗi xảy ra khi tạo Gift Code')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi tạo Gift Code'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          Tạo Gift Code
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-5xl'>
        <DialogHeader>
          <DialogTitle>Tạo Gift Code mới</DialogTitle>
          <DialogDescription>Nhập thông tin Gift Code mới cho Thiên Ảnh Mobile</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Code</FormLabel>
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
              name='totalGiftCodes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng Gift Code</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Nhập số lượng'
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('usageType') === 2 && form.watch('totalGiftCodes') > 1 && (
              <Alert variant={'warning'}>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Loại sử dụng "Một lần" với số lượng lớn hơn 1 sẽ tự động tạo mã gift code ngẫu nhiên.
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name='giftItemDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vật phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder='VD: 920|10' {...field} disabled={isSubmitting} />
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
                  <FormItem>
                    <FormLabel>Server ID</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Server ID'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='User ID'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='eventId'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Sự kiện</FormLabel>
                    <Popover open={eventPopoverOpen} onOpenChange={setEventPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            role='combobox'
                            disabled={isSubmitting}
                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}>
                            <span className='truncate'>
                              {field.value
                                ? events.find((event) => event.id === field.value)?.title || `Event #${field.value}`
                                : 'Chọn sự kiện'}
                            </span>
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-[400px] p-0'>
                        <Command>
                          <CommandInput placeholder='Tìm kiếm sự kiện...' />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy sự kiện</CommandEmpty>
                            <CommandGroup>
                              {events.map((event) => (
                                <CommandItem
                                  key={event.id}
                                  value={`${event.title} ${event.id}`}
                                  onSelect={() => {
                                    field.onChange(event.id)
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
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo Gift Code'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
