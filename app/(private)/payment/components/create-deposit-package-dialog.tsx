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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDepositPackage } from '@/services/payment'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface CreateDepositPackageDialogProps {
  onSuccess?: () => void
}

export function CreateDepositPackageDialog({ onSuccess }: CreateDepositPackageDialogProps) {
  const [open, setOpen] = useState(false)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('VNĐ')
  const [toCurrency, setToCurrency] = useState('Coin')
  const [isActive, setIsActive] = useState('true')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền nạp hợp lệ')
      return
    }

    if (!toAmount || parseFloat(toAmount) <= 0) {
      toast.error('Vui lòng nhập số coin nhận hợp lệ')
      return
    }

    setIsLoading(true)
    try {
      await createDepositPackage({
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        from_currency: fromCurrency,
        to_currency: toCurrency,
        is_active: isActive === 'true',
      })
      toast.success('Tạo gói nạp coin thành công')
      setOpen(false)
      setFromAmount('')
      setToAmount('')
      setFromCurrency('VNĐ')
      setToCurrency('Coin')
      setIsActive('true')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo gói nạp coin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Tạo gói nạp coin
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo gói nạp coin mới</DialogTitle>
            <DialogDescription>Nhập thông tin gói nạp coin để tạo mới.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='from_amount'>
                  Số tiền nạp <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='from_amount'
                  type='number'
                  placeholder='Nhập số coin'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  disabled={isLoading}
                  min='0'
                  step='1'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='from_currency'>
                  Đơn vị <span className='text-red-500'>*</span>
                </Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoading}>
                  <SelectTrigger id='from_currency'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='VNĐ'>VNĐ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='to_amount'>
                  Số coin nhận <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='to_amount'
                  type='number'
                  placeholder='Nhập số coin'
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  disabled={isLoading}
                  min='0'
                  step='1'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='to_currency'>
                  Đơn vị <span className='text-red-500'>*</span>
                </Label>
                <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoading}>
                  <SelectTrigger id='to_currency'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Coin'>Coin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='is_active'>
                Trạng thái <span className='text-red-500'>*</span>
              </Label>
              <Select value={isActive} onValueChange={setIsActive} disabled={isLoading}>
                <SelectTrigger id='is_active'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Hoạt động</SelectItem>
                  <SelectItem value='false'>Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
