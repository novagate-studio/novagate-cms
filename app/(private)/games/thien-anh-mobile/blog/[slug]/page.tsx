'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Article, deleteArticle, getArticleBySlug } from '@/services/article'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import ArticleBackground from '@/assets/images/article-background.png'
import ArticleContentBackground from '@/assets/images/article-content-background.png'
import Image from 'next/image'
import parser from '@/lib/parser'

export default function Page() {
  const params = useParams()
  const slug = params?.slug as string
  const [data, setData] = useState<Article | null>(null)
  const content = useMemo(() => {
    if (data?.content) {
      const parsed = parser.parse(data.content)
      return parsed
    }
    return null
  }, [data?.content])
  useEffect(() => {
    const fetchData = async () => {
      if (slug) {
        try {
          const response = await getArticleBySlug(slug)
          if (response.code === 200) {
            setData(response.data)
          } else {
            toast.error(response.errors?.vi || 'Lỗi khi tải bài viết.')
          }
        } catch (error) {
          console.error('Error fetching article by slug:', error)
          toast.error(error instanceof Error ? error.message : 'Lỗi khi tải bài viết.')
        }
      }
    }
    fetchData()
  }, [slug])
  const deleteArticleHandler = async () => {
    if (!data?.id) return
    try {
      const response = await deleteArticle(data.id)
      if (response.code === 200) {
        toast.success('Xoá bài viết thành công.')
        window.location.href = '/games/thien-anh-mobile/blog'
      } else {
        toast.error(response.errors?.vi || 'Lỗi khi xoá bài viết.')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi xoá bài viết.')
    }
  }
  return (
    <div className='-m-4'>
      <div className='border-b p-3 flex gap-3 items-center justify-between'>
        <Button asChild variant={'ghost'}>
          <Link href='/games/thien-anh-mobile/blog'>
            <ChevronLeft className='mr-1 h-4 w-4' />
            Quay lại
          </Link>
        </Button>
        <div className='flex gap-3'>
          <Button asChild variant={'secondary'}>
            <Link href={`/games/thien-anh-mobile/blog/${slug}/edit`}>Chỉnh sửa</Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={'destructive'}>Xoá</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xoá bài viết</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xoá bài viết này? Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Hủy</Button>
                </DialogClose>
                <Button variant='destructive' onClick={deleteArticleHandler}>
                  Xác nhận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className='relative w-full article'>
        <Image
          src={ArticleBackground}
          alt='Article Background'
          className='w-full h-screen object-cover hidden lg:block'
        />
        <div className='relative w-full max-w-4xl mx-auto lg:-mt-[40vh] p-3'>
          <Image
            src={ArticleContentBackground}
            alt='Article Content Background'
            className='w-full h-auto absolute hidden lg:block inset-x-0 top-0'
          />
          <div className='relative px-4 py-2'>
            <div className='text-black uppercase text-4xl font-bold text-center w-full'>{data?.tags}</div>
            <div className='mt-10'>
              <h1 className='font-bold text-center mb-6 text-red-500 border-b border-dashed border-red-500'>
                {data?.title}
              </h1>
              <div dangerouslySetInnerHTML={{ __html: content! }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
