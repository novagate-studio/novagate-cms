'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPlayerDetail, updatePlayer } from '@/services/player'
import { Player } from '@/models/player'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function EditPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    gender: '',
    address: '',
    email: '',
    phone: '',
    status: '',
  })

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      try {
        setLoading(true)
        const response = await getPlayerDetail(params.id as string)
        setPlayer(response.data)
        
        // Parse date of birth if exists
        if (response.data.dob) {
          setDateOfBirth(new Date(response.data.dob))
        }
        
        setFormData({
          full_name: response.data.full_name || '',
          dob: response.data.dob || '',
          gender: response.data.gender || '',
          address: response.data.address || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          status: response.data.status || '',
        })
      } catch (err) {
        console.error('Failed to fetch player detail:', err)
        setError('Không thể tải thông tin người chơi')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayerDetail()
    }
  }, [params.id])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Prepare data with formatted date
      const updateData = {
        ...formData,
        dob: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : formData.dob,
      }
      
      await updatePlayer(params.id as string, updateData)
      toast.success('Cập nhật thông tin người chơi thành công')
      router.push(`/players/${params.id}`)
    } catch (err: any) {
      console.error('Failed to update player:', err)
      toast.error(err?.response?.data?.message?.vi || 'Không thể cập nhật thông tin người chơi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-64' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className='space-y-6'>
        <Button variant='ghost' onClick={() => router.push('/')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <Card>
          <CardContent className='py-8'>
            <p className='text-center text-muted-foreground'>{error || 'Không tìm thấy người chơi'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' onClick={() => router.push(`/players/${params.id}`)}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa thông tin người chơi: {player.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='full_name'>Họ và tên</Label>
                <Input
                  id='full_name'
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder='Nhập họ và tên'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dob'>Ngày sinh</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id='dob'
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateOfBirth && 'text-muted-foreground'
                      )}>
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : <span>Chọn ngày sinh</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      initialFocus
                      captionLayout='dropdown'
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='gender'>Giới tính</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger id='gender'>
                    <SelectValue placeholder='Chọn giới tính' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Nam</SelectItem>
                    <SelectItem value='female'>Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Số điện thoại</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder='Nhập số điện thoại'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder='Nhập email'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger id='status'>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='created'>Created</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='banned'>Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='address'>Địa chỉ</Label>
                <Input
                  id='address'
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder='Nhập địa chỉ'
                />
              </div>
            </div>

            <div className='flex gap-3 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(`/players/${params.id}`)}
                disabled={saving}>
                Hủy
              </Button>
              <Button type='submit' disabled={saving}>
                {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
