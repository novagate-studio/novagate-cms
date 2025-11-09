'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { forgotPassword } from '@/services/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Form schema
const forgotPasswordSchema = z.object({
  phone: z.string().min(1, {
    message: 'Vui lòng nhập số điện thoại',
  }).regex(/^[0-9+\-\s()]+$/, {
    message: 'Số điện thoại không hợp lệ',
  }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
  })

  async function onSubmit(values: ForgotPasswordFormData) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await forgotPassword(values.phone)
      
      if (response.code === 200 || response.status) {
        toast.success('Mã OTP đã được gửi đến số điện thoại của bạn!')
        // Redirect to reset password page or show OTP input
        // You can pass the phone number as a query parameter
        setTimeout(() => {
          router.push(`/reset-password?phone=${encodeURIComponent(values.phone)}`)
        }, 1500)
      } else {
        toast.error(response.errors?.vi || 'Có lỗi xảy ra khi gửi OTP')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.errors?.vi || 'Có lỗi xảy ra khi gửi OTP'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold text-center'>Quên mật khẩu</CardTitle>
            <CardDescription className='text-center'>
              Nhập số điện thoại của bạn để nhận mã OTP qua Zalo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input 
                          type='tel' 
                          placeholder='Nhập số điện thoại đã đăng ký Zalo' 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type='submit' 
                  className='w-full' 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
                </Button>

                <div className='text-center'>
                  <Link 
                    href='/login' 
                    className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
