'use client'

import * as React from 'react'

import Logo from '@/assets/logo/PNG_BLACK.png'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Users, LogOut, CreditCard, History, ArrowRightLeft, Gamepad2 } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/contexts/user-context'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { logout } = useUser()
  const { setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    // Close sidebar on mobile after clicking menu item
    setOpenMobile(false)
  }

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenuButton size={'lg'} className='cursor-default pointer-events-none'>
          <Image src={Logo} alt='Novagate Logo' className='w-10 h-auto' />
          <div className='whitespace-nowrap font-bold ml-2 text-xl'>Quản lý</div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size={'lg'}
                className=''
                isActive={pathname === '/' || pathname.startsWith('/players')}
                asChild>
                <Link href='/' onClick={handleMenuClick}>
                  <Users className='size-5!' />
                  <span>Danh sách người dùng</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname.startsWith('/payment')} asChild>
                <Link href='/payment' onClick={handleMenuClick}>
                  <CreditCard className='size-5!' />
                  <span>Thanh toán</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname.startsWith('/deposit-history')} asChild>
                <Link href='/deposit-history' onClick={handleMenuClick}>
                  <History className='size-5!' />
                  <span>Lịch sử nạp tiền</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname.startsWith('/transfer-history')} asChild>
                <Link href='/transfer-history' onClick={handleMenuClick}>
                  <ArrowRightLeft className='size-5!' />
                  <span>Lịch sử chuyển tiền</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton size={'lg'} className='' isActive={pathname.startsWith('/games')} asChild>
                <Link href='/games' onClick={handleMenuClick}>
                  <Gamepad2 className='size-5!' />
                  <span>Danh sách game</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                size={'lg'}
                className=' text-red-600 hover:text-red-700 hover:bg-red-50'
                onClick={() => {
                  handleMenuClick()
                  logout()
                }}>
                <LogOut className='size-5!' />
                <span>Đăng xuất</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
