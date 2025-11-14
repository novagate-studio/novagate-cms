import { ResetPasswordForm } from '@/app/reset-password/components/reset-password-form'
import Mock from '@/assets/images/mock.jpg'
import Logo from '@/assets/logo/PNG_BLACK.png'
import Image from 'next/image'

export default function ResetPasswordPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <Image src={Logo} alt='Novagate Logo' width={150} height={50} className='w-40 h-auto' />
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <ResetPasswordForm />
          </div>
        </div>
      </div>
      <div className='bg-muted relative hidden lg:block'>
        <Image src={Mock} alt='Image' className='absolute inset-0 h-full w-full object-cover' />
      </div>
    </div>
  )
}
