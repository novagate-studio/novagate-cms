'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { toast } from 'sonner'
import { resetPassword } from '@/services/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

// Form schema
const resetPasswordSchema = z.object({
  otp: z.string().min(1, {
    message: 'Vui lòng nhập mã OTP',
  }).length(6, {
    message: 'Mã OTP phải có 6 chữ số',
  }),
  phone: z.string().min(1, {
    message: 'Vui lòng nhập số điện thoại',
  }).regex(/^[0-9+\-\s()]+$/, {
    message: 'Số điện thoại không hợp lệ',
  }),
  username: z.string().min(1, {
    message: 'Vui lòng nhập tên đăng nhập',
  }).min(4, {
    message: 'Tên đăng nhập phải có ít nhất 4 ký tự',
  }),
  password: z.string().min(1, {
    message: 'Vui lòng nhập mật khẩu mới',
  }).min(8, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự',
  }),
  confirm_password: z.string().min(1, {
    message: 'Vui lòng xác nhận mật khẩu',
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneFromUrl = searchParams.get('phone') || ''

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      phone: phoneFromUrl,
      username: '',
      password: '',
      confirm_password: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await resetPassword(values)
      
      if (response.code === 200 || response.status) {
        toast.success('Đặt lại mật khẩu thành công!')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi đặt lại mật khẩu')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.errors?.vi || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h1 className='text-2xl font-bold'>Đặt lại mật khẩu</h1>
            <p className='text-muted-foreground text-sm text-balance'>
              Nhập mã OTP và thông tin để đặt lại mật khẩu của bạn
            </p>
          </div>

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='Nhập số điện thoại'
                    {...field}
                    disabled={true}
                    readOnly
                    className='bg-muted cursor-not-allowed'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input type='text' placeholder='Nhập tên đăng nhập của bạn' {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã OTP</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Nhập mã OTP 6 chữ số'
                    maxLength={6}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='Nhập mật khẩu mới' {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='Nhập lại mật khẩu mới' {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Field>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
            <FieldDescription className='text-center'>
              <Link href='/login' className='inline-flex items-center gap-2 hover:underline underline-offset-4'>
                <ArrowLeft className='h-4 w-4' />
                Quay lại đăng nhập
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
