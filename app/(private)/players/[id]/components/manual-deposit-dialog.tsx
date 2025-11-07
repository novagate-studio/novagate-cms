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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { manualDeposit } from '@/services/player'
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'

interface ManualDepositDialogProps {
  playerId: string
  onSuccess?: () => void
}

export function ManualDepositDialog({ playerId, onSuccess }: ManualDepositDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }

    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú')
      return
    }

    setIsLoading(true)
    try {
      await manualDeposit(playerId, {
        amount: parseFloat(amount),
        note: note.trim(),
      })
      toast.success('Nạp tiền thành công')
      setOpen(false)
      setAmount('')
      setNote('')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'secondary'}>
          <Wallet className="mr-2 h-4 w-4" />
          Nạp tiền
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nạp tiền thủ công</DialogTitle>
            <DialogDescription>
              Nhập số tiền và ghi chú để nạp tiền cho người chơi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">
                Số tiền <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Nhập số tiền"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">
                Ghi chú <span className="text-red-500">*</span>
              </Label>
              <Input
                id="note"
                type="text"
                placeholder="Nhập ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
