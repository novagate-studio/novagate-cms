'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { set, z } from 'zod'
import { DobPicker } from './dob-picker'
import { checkUsername, checkEmail, sendOTP, registry } from '@/services/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cookiesInstance } from '@/services/cookies'
const formSchema = z
  .object({
    fullname: z.string().min(1, {
      message: 'Họ và tên không được để trống',
    }),
    username: z
      .string()
      .min(4, {
        message: 'Tên đăng nhập phải có ít nhất 4 ký tự',
      })
      .max(32, {
        message: 'Tên đăng nhập không được vượt quá 32 ký tự',
      })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: 'Tên đăng nhập chỉ được chứa chữ cái và số',
      })
      .refine(
        async (username) => {
          try {
            const response = await checkUsername(username)
            return response.code === 200
          } catch (error) {
            return false
          }
        },
        {
          message: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác',
        }
      ),
    phone: z
      .string()
      .min(1, {
        message: 'Số điện thoại không được để trống',
      })
      .regex(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
        message: 'Số điện thoại không hợp lệ (VD: 0901234567, +84901234567)',
      }),
    email: z
      .string()
      .min(1, {
        message: 'Email không được để trống',
      })
      .email({
        message: 'Email không hợp lệ',
      })
      .refine(
        async (email) => {
          try {
            const response = await checkEmail(email)
            return response.code === 200
          } catch (error) {
            return false
          }
        },
        {
          message: 'Email đã được sử dụng, vui lòng sử dụng email khác',
        }
      ),
    password: z
      .string()
      .min(8, {
        message: 'Mật khẩu phải có ít nhất 8 ký tự',
      })
      .max(128, {
        message: 'Mật khẩu không được vượt quá 128 ký tự',
      })
      .regex(/[a-z]/, {
        message: 'Mật khẩu phải chứa ít nhất một chữ cái thường',
      })
      .regex(/[A-Z]/, {
        message: 'Mật khẩu phải chứa ít nhất một chữ cái hoa',
      })
      .regex(/[0-9]/, {
        message: 'Mật khẩu phải chứa ít nhất một số',
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
        message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
      }),
    confirmPassword: z.string(),
    dob: z
      .date()
      .nullable()
      .refine(
        (date) => {
          return date !== null
        },
        {
          message: 'Vui lòng chọn ngày sinh',
        }
      )
      .refine(
        (date) => {
          if (!date) return false
          const today = new Date()
          const age = today.getFullYear() - date.getFullYear()
          const monthDiff = today.getMonth() - date.getMonth()
          const dayDiff = today.getDate() - date.getDate()

          // Calculate exact age
          const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age

          return exactAge >= 18
        },
        {
          message: 'Bạn phải đủ 18 tuổi trở lên để đăng ký',
        }
      ),
    gender: z.enum(['male', 'female', 'prefer-not-to-say']),
    address: z
      .string()
      .min(1, {
        message: 'Địa chỉ không được để trống',
      })
      .min(5, {
        message: 'Địa chỉ phải có ít nhất 5 ký tự',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
export function SignupForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [tab, setTab] = useState<'info' | 'verify'>('info')
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: null,
      gender: 'prefer-not-to-say',
      address: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await sendOTP(values.phone)
      if (response.code === 200) {
        setShowOTPDialog(true)
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }
  const continueToVerification = async () => {
    const isValid = await form.trigger(['fullname', 'username', 'password', 'confirmPassword'])
    if (isValid) {
      setTab('verify')
    }
  }
  const handleConfirmOTP = async () => {
    if (isConfirming) return
    
    setIsConfirming(true)
    try {
      const response = await registry({
        full_name: form.getValues('fullname'),
        username: form.getValues('username'),
        password: form.getValues('password'),
        password_confirmation: form.getValues('confirmPassword'),
        phone: form.getValues('phone'),
        dob: form.getValues('dob')!.toISOString(),
        gender: form.getValues('gender'),
        address: form.getValues('address'),
        email: form.getValues('email'),
        otp: otp,
      })
      if (response.code === 200) {
        toast.success('Đăng ký thành công!')
        cookiesInstance.set('access_token', response.data.token)
        router.push('/')
      } else {
        toast.error(response.errors?.vi || 'Lỗi không xác định, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Lỗi không xác định, vui lòng thử lại')
    } finally {
      setIsConfirming(false)
      setShowOTPDialog(false)
      setOtp('')
    }
  }
  return (
    <>
      <Form {...form}>
        <form className={cn('flex flex-col gap-6', className)} onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h1 className='text-2xl font-bold'>Tạo tài khoản của bạn</h1>
            <p className='text-muted-foreground text-sm text-balance'>
              Điền vào biểu mẫu bên dưới để tạo tài khoản của bạn
            </p>
          </div>
          <Tabs defaultValue='info' value={tab} onValueChange={(tab) => {}} className='w-full'>
            <TabsList className='w-full mb-4'>
              <TabsTrigger value='info'>Thông tin đăng nhập</TabsTrigger>
              <TabsTrigger value='verify'>Xác minh</TabsTrigger>
            </TabsList>
            <TabsContent value='info'>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name='fullname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập họ và tên của bạn' {...field} />
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
                        <Input placeholder='Chọn tên đăng nhập của bạn' {...field} />
                      </FormControl>
                      <FormDescription>
                        {'Tên đăng nhập dài 4-32 ký tự chỉ được phép chứa chữ cái hoặc số.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='Nhập mật khẩu của bạn' {...field} />
                      </FormControl>
                      <FormDescription>
                        Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='Nhập lại mật khẩu của bạn' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type='button' onClick={continueToVerification}>
                    Tiếp tục
                  </Button>
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value='verify'>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input type='tel' placeholder='Nhập số điện thoại đã đăng ký Zalo' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='Nhập email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='dob'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <DobPicker value={field.value} onChange={(date) => field.onChange(date || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange}>
                          <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='male' id='male' />
                            <Label htmlFor='male'>Nam</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='female' id='female' />
                            <Label htmlFor='female'>Nữ</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='prefer-not-to-say' id='prefer-not-to-say' />
                            <Label htmlFor='prefer-not-to-say'>Bí mật</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input type='text' placeholder='Nhập địa chỉ' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <Button variant='outline' onClick={() => setTab('info')} disabled={isSubmitting}>
                    Quay lại
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
                  </Button>
                </div>
              </FieldGroup>
            </TabsContent>
          </Tabs>

          <Field>
            <FieldDescription className='px-6 text-center'>
              Đã có tài khoản? <Link href='/login'>Đăng nhập</Link>
            </FieldDescription>
          </Field>
        </form>
      </Form>
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập mã OTP</DialogTitle>
            <DialogDescription>Vui lòng nhập mã OTP đã được gửi đến Zalo của bạn.</DialogDescription>
          </DialogHeader>
          <InputOTP value={otp} onChange={setOtp} maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <DialogFooter>
            <Button type='button' onClick={handleConfirmOTP} disabled={isConfirming}>
              {isConfirming ? 'Đang xác nhận...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
