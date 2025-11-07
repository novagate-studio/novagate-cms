'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { resetPassword } from '@/services/player'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'

interface ResetPasswordDialogProps {
  playerId: string
  playerName?: string
  onSuccess?: () => void
}

export function ResetPasswordDialog({ playerId, playerName, onSuccess }: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await resetPassword(playerId)
      toast.success('Đặt lại mật khẩu thành công')
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound className="mr-2 h-4 w-4" />
          Đặt lại mật khẩu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận đặt lại mật khẩu</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đặt lại mật khẩu cho người chơi{' '}
            <span className="font-semibold">{playerName || 'này'}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Hành động này sẽ gửi email đặt lại mật khẩu cho người chơi. Người chơi sẽ cần sử dụng liên kết trong email để tạo mật khẩu mới.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
