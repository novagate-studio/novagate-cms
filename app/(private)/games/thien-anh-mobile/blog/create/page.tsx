'use client'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import List from '@editorjs/list'
import Table from '@editorjs/table'
import TextVariantTune from '@editorjs/text-variant-tune'
import Marker from '@editorjs/marker'
import Paragraph from 'editorjs-paragraph-with-alignment'
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune'
import { useEffect } from 'react'
export default function BlogCreatePage() {
  useEffect(() => {
    initEditor()
  }, [])
  const initEditor = () => {
    const editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        list: List,
        image: Image,
        table: Table,
        textVariant: TextVariantTune as any,
        blockAlign: {
          class: AlignmentTuneTool as any,
        },
        paragraph: {
          class: Paragraph as any,
          tunes: ['textVariant'],
        },
        marker: Marker as any,
      },
      inlineToolbar: true,
      placeholder: 'Viết nội dung bài viết ở đây...',
      tunes: ['textVariant', 'blockAlign'],
    })
  }
  return (
    <div className=''>
      <h1 className='text-2xl font-bold mb-4'>Create Blog Post</h1>
      <p>This is the page to create a new blog post for Thien Anh Mobile game.</p>
      <div id='editorjs' className='max-w-5xl p-3 border rounded-lg mx-auto'></div>
    </div>
  )
}
