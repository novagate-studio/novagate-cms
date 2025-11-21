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
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateEvent } from '@/services/event'
import { Event } from '@/models/event'

const eventSchema = z.object({
  title: z.string().min(1, {
    message: 'Tên sự kiện không được để trống',
  }),
  description: z.string().min(1, {
    message: 'Mô tả không được để trống',
  }),
})

type EventFormData = z.infer<typeof eventSchema>

interface EditEventDialogProps {
  event: Event
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventUpdated: () => void
}

export function EditEventDialog({ event, open, onOpenChange, onEventUpdated }: EditEventDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: event.title,
        description: event.description,
      })
    }
  }, [open, event, form])

  async function onSubmit(values: EventFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await updateEvent(event.id, values)
      
      if (response.code === 200 || response.status) {
        toast.success('Cập nhật sự kiện thành công!')
        onOpenChange(false)
        onEventUpdated()
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi cập nhật sự kiện')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.errors?.vi || 'Có lỗi xảy ra khi cập nhật sự kiện'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          <DialogDescription>Cập nhật thông tin sự kiện</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sự kiện</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên sự kiện' {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập mô tả sự kiện' {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
