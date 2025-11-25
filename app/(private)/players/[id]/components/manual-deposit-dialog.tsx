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
import { Checkbox } from '@/components/ui/checkbox'

interface ManualDepositDialogProps {
  playerId: string
  onSuccess?: () => void
}

export function ManualDepositDialog({ playerId, onSuccess }: ManualDepositDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [vndAmount, setVndAmount] = useState('')
  const [isRevenueApplicable, setIsRevenueApplicable] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      toast.error('Vui lòng nhập số coin')
      return
    }

    if (!note.trim()) {
      toast.error('Vui lòng nhập ghi chú')
      return
    }

    setIsLoading(true)
    try {
      await manualDeposit(playerId, {
        amount: +amount,
        note: note.trim(),
        vnd_amount: isRevenueApplicable ? (vndAmount ? +vndAmount : undefined) : undefined,
        is_revenue_applicable: isRevenueApplicable,
      })
      toast.success('Nạp coin thành công')
      setOpen(false)
      setAmount('')
      setNote('')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi nạp coin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'secondary'}>
          <Wallet className='mr-2 h-4 w-4' />
          Nạp/trừ coin
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nạp/trừ coin</DialogTitle>
            <DialogDescription>Nhập số coin và ghi chú để nạp/trừ coin cho người chơi.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='amount'>
                Số coin <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='amount'
                type='number'
                placeholder='Nhập số coin'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='note'>
                Ghi chú <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='note'
                type='text'
                placeholder='Nhập ghi chú'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='isRevenueApplicable'
                checked={isRevenueApplicable}
                onCheckedChange={(checked) => setIsRevenueApplicable(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor='isRevenueApplicable'>Tính doanh thu</Label>
            </div>
            {isRevenueApplicable && (
              <div className='grid gap-2'>
                <Label htmlFor='revenue'>Doanh thu (VNĐ)</Label>
                <Input
                  id='revenue'
                  type='number'
                  placeholder='Nhập doanh thu (Mặc định = số coin * 1000)'
                  value={vndAmount}
                  onChange={(e) => setVndAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
