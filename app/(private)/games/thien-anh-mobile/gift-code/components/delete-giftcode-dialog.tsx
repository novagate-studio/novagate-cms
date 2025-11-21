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
import { deleteGiftCode } from '@/services/giftcode'

interface DeleteGiftCodeDialogProps {
  giftCodeId: number
  giftCodeCode: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGiftCodeDeleted: () => void
}

export function DeleteGiftCodeDialog({
  giftCodeId,
  giftCodeCode,
  open,
  onOpenChange,
  onGiftCodeDeleted,
}: DeleteGiftCodeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      const response = await deleteGiftCode(giftCodeId)
      
      if (response.code === 200 || response.status) {
        toast.success('Xóa Gift Code thành công!')
        onOpenChange(false)
        onGiftCodeDeleted()
      } else {
        const errorMessage = typeof response.message === 'object' ? response.message.vi : response.message
        toast.error(errorMessage || 'Có lỗi xảy ra khi xóa Gift Code')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi xóa Gift Code'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Xóa Gift Code</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa Gift Code <span className='font-semibold font-mono'>&quot;{giftCodeCode}&quot;</span>? Hành động này không thể hoàn tác.
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
