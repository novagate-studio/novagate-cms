'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Article, getArticles } from '@/services/article'
import { debounce } from 'lodash'
import { Plus, Search } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at_desc')

  const getSortParams = (sortValue: string) => {
    const parts = sortValue.split('_')
    const direction = parts[parts.length - 1]
    const field = parts.slice(0, -1).join('_')
    return {
      orderBy: field,
      orderDirection: direction || 'desc',
    }
  }

  const fetchArticles = useCallback(
    async (offset = 0, isNewSearch = false) => {
      try {
        const { orderBy, orderDirection } = getSortParams(sort)
        const response = await getArticles({
          search: search || undefined,
          orderBy,
          orderDirection,
          offset,
          limit: 12,
          game_id: 3,
        })

        if (response.code === 200 && response.data) {
          const newArticles = response.data || []
          setArticles((prev) => (isNewSearch ? newArticles : [...prev, ...newArticles]))
          setHasMore(newArticles.length === 12)
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [search, sort]
  )

  const debouncedFetchArticles = useMemo(() => debounce(() => fetchArticles(0, true), 500), [fetchArticles])

  useEffect(() => {
    setIsLoading(true)
    setArticles([])
    debouncedFetchArticles()
    return () => {
      debouncedFetchArticles.cancel()
    }
  }, [search, sort, debouncedFetchArticles])

  const fetchMoreArticles = () => {
    fetchArticles(articles.length, false)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Bài viết</h1>
        </div>
        <Link href='/games/thien-anh-mobile/blog/create'>
          <Button>
            <Plus className='h-4 w-4 mr-2' />
            Tạo bài viết
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo tiêu đề hoặc mô tả...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='created_at_desc'>Mới nhất</SelectItem>
                <SelectItem value='created_at_asc'>Cũ nhất</SelectItem>
                <SelectItem value='updated_at_desc'>Sửa gần đây</SelectItem>
                <SelectItem value='title_asc'>Tiêu đề (A-Z)</SelectItem>
                <SelectItem value='title_desc'>Tiêu đề (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className='space-y-3  rounded-lg mt-6'>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground'>Không có bài viết nào</div>
          ) : (
            <InfiniteScroll
              dataLength={articles.length}
              next={fetchMoreArticles}
              hasMore={hasMore}
              loader={
                <div className='space-y-3  rounded-lg mt-6'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-32 w-full' />
                  ))}
                </div>
              }
              endMessage={
                <p className='text-center text-muted-foreground py-4'>
                  {articles.length > 0 ? 'Đã hiển thị tất cả bài viết' : ''}
                </p>
              }>
              <div className='space-y-3  rounded-lg'>
                {articles.map((article) => (
                  <Link 
                    href={`/games/thien-anh-mobile/blog/${article.slug}`}
                    key={article.id}
                    className='flex relative items-start h-32 gap-4 '>
                    <Image unoptimized width={400} height={300} src={article.thumbnail} alt={article.title} className='h-full w-auto shrink-0 aspect-video object-cover' />
                    <div className=''>
                      <h3 className='text-lg font-semibold leading-tight line-clamp-2'>
                        <span className='text-red-700 mr-1 uppercase'>[ {article.tags} ]</span>
                        {article.title}
                      </h3>
                      <p className='line-clamp-2 leading-tight'>{article.description}</p>
                      <div className='absolute bottom-1 right-4 md:right-6 text-sm text-gray-600'>{moment(article.created_at).format('dd/mm/yyyy')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
