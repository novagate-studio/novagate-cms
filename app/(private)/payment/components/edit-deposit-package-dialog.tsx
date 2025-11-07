'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateDepositPackage, deleteDepositPackage } from '@/services/payment'
import { DepositPackage } from '@/services/payment'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface EditDepositPackageDialogProps {
  package: DepositPackage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditDepositPackageDialog({ package: pkg, open, onOpenChange, onSuccess }: EditDepositPackageDialogProps) {
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('VNĐ')
  const [toCurrency, setToCurrency] = useState('Coin')
  const [isActive, setIsActive] = useState('true')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (pkg) {
      setFromAmount(pkg.from_amount.toString())
      setToAmount(pkg.to_amount.toString())
      setFromCurrency(pkg.from_currency)
      setToCurrency(pkg.to_currency)
      setIsActive(pkg.is_active.toString())
    }
  }, [pkg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pkg) return

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
      await updateDepositPackage(pkg.id, {
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        from_currency: fromCurrency,
        to_currency: toCurrency,
        is_active: isActive === 'true',
      })
      toast.success('Cập nhật gói nạp tiền thành công')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật gói nạp tiền')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!pkg) return

    setIsDeleting(true)
    try {
      await deleteDepositPackage(pkg.id)
      toast.success('Xóa gói nạp tiền thành công')
      onOpenChange(false)
      setShowDeleteConfirm(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa gói nạp tiền')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!pkg) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa gói nạp tiền #{pkg.id}</DialogTitle>
            <DialogDescription>Cập nhật thông tin gói nạp tiền.</DialogDescription>
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
                  placeholder='Nhập số tiền'
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
          <DialogFooter className='flex justify-between sm:justify-between'>
            <Button
              type='button'
              variant='destructive'
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}>
              <Trash2 className='mr-2 h-4 w-4' />
              Xóa
            </Button>
            <div className='flex gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading || isDeleting}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading || isDeleting}>
                {isLoading ? 'Đang xử lý...' : 'Cập nhật'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa gói nạp tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa gói nạp tiền #{pkg.id} ({formatNumber(pkg.from_amount)} {pkg.from_currency} → {formatNumber(pkg.to_amount)} {pkg.to_currency})?
              <br />
              <span className='text-red-500 font-semibold'>Hành động này không thể hoàn tác.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}
