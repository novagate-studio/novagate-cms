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
import { forgotPassword } from '@/services/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Form schema
const forgotPasswordSchema = z.object({
  phone: z.string().min(1, {
    message: 'Vui lòng nhập số điện thoại',
  }).regex(/^[0-9+\-\s()]+$/, {
    message: 'Số điện thoại không hợp lệ',
  }),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
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
    <Form {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <FieldGroup>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h1 className='text-2xl font-bold'>Quên mật khẩu</h1>
            <p className='text-muted-foreground text-sm text-balance'>
              Nhập số điện thoại của bạn để nhận mã OTP qua Zalo
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
                    placeholder='Nhập số điện thoại đã đăng ký Zalo' 
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Field>
            <Button 
              type='submit' 
              className='w-full' 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
            </Button>
            <FieldDescription className='text-center'>
              <Link 
                href='/login' 
                className='inline-flex items-center gap-2 hover:underline underline-offset-4'
              >
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
