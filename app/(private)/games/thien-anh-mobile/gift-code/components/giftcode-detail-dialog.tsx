'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GiftCode } from '@/models/giftcode'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface GiftCodeDetailDialogProps {
  giftCode: GiftCode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GiftCodeDetailDialog({ giftCode, open, onOpenChange }: GiftCodeDetailDialogProps) {
  if (!giftCode) return null

  const getUsageTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <Badge variant='default'>Nhiều lần</Badge>
      case 2:
        return <Badge variant='secondary'>Một lần</Badge>
      default:
        return <Badge variant='outline'>Không xác định</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Chi tiết Gift Code</DialogTitle>
          <DialogDescription>Thông tin chi tiết về Gift Code</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>ID</div>
              <div className='text-sm'>{giftCode.id}</div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Mã Code</div>
              <div className='text-sm font-mono font-semibold uppercase'>{giftCode.code}</div>
            </div>
          </div>

          <div>
            <div className='text-sm font-medium text-muted-foreground mb-1'>Loại sử dụng</div>
            {getUsageTypeBadge(giftCode.usage_type)}
          </div>

          <div>
            <div className='text-sm font-medium text-muted-foreground'>Mô tả vật phẩm</div>
            <div className='text-sm break-all'>{giftCode.gift_item_description || '-'}</div>
          </div>

          <div>
            <div className='text-sm font-medium text-muted-foreground'>Mô tả tiền</div>
            <div className='text-sm break-all'>{giftCode.gift_money_description || '-'}</div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Server ID</div>
              <div className='text-sm'>{giftCode.server_id || '-'}</div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Server</div>
              <div className='text-sm'>{giftCode.server?.name || '-'}</div>
            </div>
          </div>

          {giftCode.usage_type === 2 && (
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Người dùng</div>
              {giftCode.user ? (
                <div className='text-sm'>
                  <div className='font-medium'>{giftCode.user.user_name}</div>
                  <div className='text-muted-foreground'>ID: {giftCode.user.id}</div>
                </div>
              ) : (
                <div className='text-sm'>-</div>
              )}
            </div>
          )}

          <div>
            <div className='text-sm font-medium text-muted-foreground'>Admin</div>
            {giftCode.admin && (
              <div className='text-sm'>
                <div className='font-medium'>{giftCode.admin.user_name}</div>
                <div className='text-muted-foreground'>ID: {giftCode.admin.id}</div>
              </div>
            )}
          </div>

          <div>
            <div className='text-sm font-medium text-muted-foreground'>Sự kiện</div>
            {giftCode.event ? (
              <div className='text-sm'>
                <div className='font-medium'>{giftCode.event.title}</div>
                <div className='text-muted-foreground'>{giftCode.event.description}</div>
                <div className='text-muted-foreground text-xs'>ID: {giftCode.event.id}</div>
              </div>
            ) : (
              <div className='text-sm'>-</div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Thời gian bắt đầu</div>
              <div className='text-sm'>
                {giftCode.start_time ? format(new Date(giftCode.start_time), 'dd/MM/yyyy HH:mm') : '-'}
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Thời gian kết thúc</div>
              <div className='text-sm'>
                {giftCode.end_time ? format(new Date(giftCode.end_time), 'dd/MM/yyyy HH:mm') : '-'}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Ngày tạo</div>
              <div className='text-sm'>{format(new Date(giftCode.created_at), 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Ngày cập nhật</div>
              <div className='text-sm'>{format(new Date(giftCode.updated_at), 'dd/MM/yyyy HH:mm')}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
