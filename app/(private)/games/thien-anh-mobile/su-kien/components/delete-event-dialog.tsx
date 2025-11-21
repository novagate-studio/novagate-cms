'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { deleteEvent } from '@/services/event'

interface DeleteEventDialogProps {
  eventId: number
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventDeleted: () => void
}

export function DeleteEventDialog({ eventId, eventTitle, open, onOpenChange, onEventDeleted }: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      const response = await deleteEvent(eventId)
      
      if (response.code === 200 || response.status) {
        toast.success('Xóa sự kiện thành công!')
        onOpenChange(false)
        onEventDeleted()
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi xóa sự kiện')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.errors?.vi || 'Có lỗi xảy ra khi xóa sự kiện'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Xóa sự kiện</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sự kiện <span className='font-semibold'>&quot;{eventTitle}&quot;</span>? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type='button' variant='destructive' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
