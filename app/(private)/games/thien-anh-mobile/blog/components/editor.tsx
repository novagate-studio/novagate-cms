'use client'
import { uploadFile } from '@/services/article'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import Table from '@editorjs/table'
import Paragraph from 'editorjs-paragraph-with-alignment'
import { useEffect } from 'react'
export default function Editor({
  editorRef,
  savedData,
}: {
  editorRef?: React.MutableRefObject<EditorJS | null>
  savedData?: OutputData | null
}) {
  useEffect(() => {
    initEditor()
  }, [])
  const initEditor = () => {
    const editor = new EditorJS({
      holder: 'editorjs',
      data: savedData || undefined,
      tools: {
        header: Header,
        list: List,
        image: {
          class: Image,
          config: {
            endpoints: {
              byFile: `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/api/v2/files/upload`,
            },
            uploader: {
              async uploadByFile(file: File) {
                try {
                  const response = await uploadFile(file)
                  const data = response.data
                  if (data.url) {
                    return {
                      success: 1,
                      file: {
                        url: data.url,
                      },
                    }
                  } else {
                    return {
                      success: 0,
                    }
                  }
                } catch (error) {
                  console.error('Error uploading image:', error)
                  return {
                    success: 0,
                  }
                }
              },
            },
          },
        },
        table: Table,
        paragraph: {
          class: Paragraph as any,
        },
        marker: Marker as any,
      },
      inlineToolbar: true,
      placeholder: 'Viết nội dung bài viết ở đây...',
    })
    if (editorRef) {
      editorRef.current = editor
    }
  }
  return (
    <div className='p-3 border rounded-lg w-full'>
      <div id='editorjs' className='max-w-5xl w-full mx-auto'></div>
    </div>
  )
}
