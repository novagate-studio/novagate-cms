import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/index.css'
const font = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
export const metadata: Metadata = {
  title: 'Quản lý tài khoản - Novagate Studio',
  description: 'Quản lý tài khoản người dùng Novagate Studio',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>Under maintenance</div>
    // <html lang='en' className='light'>
    //   <body className={`${font.variable} antialiased light`}>
    //     {children}
    //     <Toaster richColors />
    //   </body>
    // </html>
  )
}
