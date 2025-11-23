'use client'

import * as React from 'react'

import Logo from '@/assets/logo/PNG_BLACK.png'
import ThienAnhMobileLogo from '@/assets/logo/thien-anh-mobile.png'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { useUser } from '@/contexts/user-context'
import { ArrowRightLeft, CreditCard, History, LogOut, Users, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { logout } = useUser()
  const { setOpenMobile } = useSidebar()
  const [isThienAnhOpen, setIsThienAnhOpen] = React.useState(pathname.startsWith('/games/thien-anh-mobile'))

  const handleMenuClick = () => {
    // Close sidebar on mobile after clicking menu item
    setOpenMobile(false)
  }

  // Update Thien Anh Mobile menu open state when pathname changes
  React.useEffect(() => {
    if (pathname.startsWith('/games/thien-anh-mobile')) {
      setIsThienAnhOpen(true)
    }
  }, [pathname])

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
          <SidebarGroupContent>
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
              <Collapsible open={isThienAnhOpen} onOpenChange={setIsThienAnhOpen} className='group/collapsible'>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size={'lg'}
                      isActive={pathname.startsWith('/games/thien-anh-mobile')}
                      tooltip='Thiên Ảnh Mobile'
                      className='gap-1.5! px-1!'>
                      <Image src={ThienAnhMobileLogo} alt='Thiên Ảnh Mobile Logo' className='size-10!' />
                      <span>Thiên Ảnh Mobile</span>
                      <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/games/thien-anh-mobile/overview'}>
                          <Link href='/games/thien-anh-mobile/overview' onClick={handleMenuClick}>
                            <span>Tổng quan</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/games/thien-anh-mobile/events'}>
                          <Link href='/games/thien-anh-mobile/events' onClick={handleMenuClick}>
                            <span>Sự kiện</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/games/thien-anh-mobile/gift-code'}>
                          <Link href='/games/thien-anh-mobile/gift-code' onClick={handleMenuClick}>
                            <span>Gift Code</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === '/games/thien-anh-mobile/transfer-history'}>
                          <Link href='/games/thien-anh-mobile/transfer-history' onClick={handleMenuClick}>
                            <span>Lịch sử chuyển tiền</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
