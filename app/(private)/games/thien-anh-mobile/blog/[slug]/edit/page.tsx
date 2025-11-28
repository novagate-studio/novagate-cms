'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getArticleBySlug, updateArticle, uploadFile } from '@/services/article'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import Editor from '../../components/editor'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import editorParser from 'editorjs-parser'
import { Label } from '@/components/ui/label'

const blogSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  tags: z.string().min(1, 'Thẻ không được để trống'),
  banner: z.string().optional(),
  thumbnail: z.string().optional(),
})

type BlogFormData = z.infer<typeof blogSchema>

export default function BlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const [originalBanner, setOriginalBanner] = useState<string>('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [originalThumbnail, setOriginalThumbnail] = useState<string>('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [articleId, setArticleId] = useState<number | null>(null)
  const editorRef = useRef<EditorJS | null>(null)
  const [savedData, setSavedData] = useState<OutputData | null>(null)

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      banner: '',
      thumbnail: '',
    },
  })

  // Load article data
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true)
        const response = await getArticleBySlug(slug)

        if (response.code === 200 && response.data) {
          const article = response.data
          setArticleId(article.id)
          form.reset({
            title: article.title,
            description: article.description,
            tags: article.tags,
            banner: article.banner,
            thumbnail: article.thumbnail,
          })
          setBannerPreview(article.banner)
          setOriginalBanner(article.banner)
          setThumbnailPreview(article.thumbnail)
          setOriginalThumbnail(article.thumbnail)
          setSavedData(article.content)
        } else {
          toast.error('Không thể tải bài viết')
          router.push('/games/thien-anh-mobile/blog')
        }
      } catch (error) {
        console.error('Error loading article:', error)
        toast.error('Có lỗi xảy ra khi tải bài viết')
        router.push('/games/thien-anh-mobile/blog')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadArticle()
    }
  }, [slug, form, router])

  const handleBannerSelect = (file: File) => {
    setBannerFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleThumbnailSelect = (file: File) => {
    setThumbnailFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImages = async () => {
    let bannerUrl = originalBanner
    let thumbnailUrl = originalThumbnail

    try {
      setIsUploading(true)

      if (bannerFile) {
        const bannerResponse = await uploadFile(bannerFile)
        if (bannerResponse.code === 200 && bannerResponse.data?.url) {
          bannerUrl = bannerResponse.data.url
        } else {
          throw new Error('Lỗi tải lên banner')
        }
      }

      if (thumbnailFile) {
        const thumbnailResponse = await uploadFile(thumbnailFile)
        if (thumbnailResponse.code === 200 && thumbnailResponse.data?.url) {
          thumbnailUrl = thumbnailResponse.data.url
        } else {
          throw new Error('Lỗi tải lên thumbnail')
        }
      }

      return { bannerUrl, thumbnailUrl }
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: BlogFormData) {
    if (isSubmitting) return
    setShowConfirmDialog(true)
  }

  const handleConfirmUpdate = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)

    if (!articleId) {
      toast.error('Không tìm thấy ID bài viết')
      setIsSubmitting(false)
      return
    }

    const cleanData = await editorRef.current?.save()
    if (!cleanData?.blocks || cleanData.blocks.length === 0) {
      toast.error('Nội dung bài viết không được để trống')
      setIsSubmitting(false)
      return
    }

    try {
      let bannerUrl = originalBanner
      let thumbnailUrl = originalThumbnail

      if (bannerFile || thumbnailFile) {
        const { bannerUrl: bUrl, thumbnailUrl: tUrl } = await uploadImages()
        bannerUrl = bUrl
        thumbnailUrl = tUrl
      }

      const values = form.getValues()
      const payload = {
        title: values.title,
        description: values.description,
        content: cleanData,
        tags: values.tags,
        banner: bannerUrl,
        thumbnail: thumbnailUrl,
      }

      const response = await updateArticle(articleId, payload)

      if (response.code === 200 || response.status) {
        toast.success('Cập nhật bài viết thành công!')
        router.push(`/games/thien-anh-mobile/blog/${slug}`)
      } else {
        const errorMessage = typeof response.message === 'object' ? response.message.vi : response.message
        toast.error(errorMessage || 'Có lỗi xảy ra khi cập nhật bài viết')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.vi || error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài viết'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <div className='h-8 w-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto'></div>
          <p className='text-gray-500'>Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Chỉnh sửa bài viết</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài viết</CardTitle>
          <CardDescription>Chỉnh sửa thông tin bài viết</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tiêu đề bài viết' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Nhập mô tả bài viết' {...field} disabled={isSubmitting} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tag' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-6'>
                <FormField
                  control={form.control}
                  name='banner'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner (Tỉ lệ 4:5)</FormLabel>
                      <div className='h-80 relative aspect-4/5'>
                        {bannerPreview && (
                          <div className='absolute rounded-lg inset-0 overflow-hidden border bg-muted'>
                            <Image src={bannerPreview} alt='Banner preview' fill className='object-cover' />
                          </div>
                        )}
                        <div
                          className={cn(
                            bannerPreview ? 'opacity-0 bg-black/70 text-white' : 'opacity-100',
                            'absolute inset-0 hover:opacity-100 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary transition-colors'
                          )}>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleBannerSelect(file)
                            }}
                            disabled={isSubmitting}
                            className='absolute inset-0 opacity-0 cursor-pointer'
                          />
                          <div className='space-y-2'>
                            <Upload className='mx-auto h-8 w-8' />
                            <p className='text-sm font-medium'>Tải lên banner</p>
                            <p className='text-xs'>PNG, JPG, GIF (tối đa 10MB) - Khuyến nghị 4:5</p>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='thumbnail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail (Tỉ lệ 16:9)</FormLabel>
                      <div className='h-80 relative aspect-video'>
                        {thumbnailPreview && (
                          <div className='absolute inset-0 rounded-lg overflow-hidden border bg-muted'>
                            <Image src={thumbnailPreview} alt='Thumbnail preview' fill className='object-cover' />
                          </div>
                        )}
                        <div
                          className={cn(
                            thumbnailPreview ? 'opacity-0 bg-black/70 text-white' : 'opacity-100',
                            'hover:opacity-100 absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors'
                          )}>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleThumbnailSelect(file)
                            }}
                            disabled={isSubmitting}
                            className='absolute inset-0 opacity-0 cursor-pointer'
                          />
                          <div className='space-y-2'>
                            <Upload className='mx-auto h-8 w-8' />
                            <p className='text-sm font-medium'>Tải lên thumbnail</p>
                            <p className='text-xs'>PNG, JPG, GIF (tối đa 10MB) - Khuyến nghị 16:9</p>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {savedData && (
                <div className='space-y-2'>
                  <Label>Nội dung</Label>
                  <Editor editorRef={editorRef} savedData={savedData} />
                  <FormMessage />
                </div>
              )}

              <div className='flex gap-4'>
                <Button type='submit' disabled={isSubmitting || isUploading}>
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    router.push(`/games/thien-anh-mobile/blog/${slug}`)
                  }}
                  disabled={isSubmitting}>
                  Hủy
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật bài viết</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn cập nhật bài viết này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowConfirmDialog(false)}
              disabled={isUploading || isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={isUploading || isSubmitting}>
              {isUploading || isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
