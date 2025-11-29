'use client'
import { uploadFile } from '@/services/article'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Image from '@editorjs/image'
import List from '@editorjs/list'
import Marker from '@editorjs/marker'
import Paragraph from 'editorjs-paragraph-with-alignment'
import { useEffect } from 'react'

class CustomTable {
  static get toolbox() {
    return {
      title: 'Table',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table-properties-icon lucide-table-properties"><path d="M15 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3"/><path d="M21 15H3"/></svg>',
    }
  }

  private data: any
  private api: any

  constructor({ data, api }: any) {
    this.data = data || {
      content: [
        ['', ''],
        ['', ''],
      ],
    }
    this.api = api
  }

  render() {
    const wrapper = document.createElement('div')
    const table = document.createElement('table')
    table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 10px 0;'

    const content = this.data?.content || [
      ['', ''],
      ['', ''],
    ]

    content.forEach((row: any[], rowIndex: number) => {
      const tr = document.createElement('tr')
      row.forEach((cell: any, cellIndex: number) => {
        const td = document.createElement('td')
        td.style.cssText =
          'border: 1px solid #ddd; padding: 8px; min-width: 100px; min-height: 40px; position: relative;'

        const cellContent = document.createElement('div')
        cellContent.contentEditable = 'true'
        cellContent.style.cssText = 'min-height: 20px; outline: none;'

        if (typeof cell === 'string') {
          cellContent.innerHTML = cell
        } else if (cell && cell.image) {
          const img = document.createElement('img')
          img.src = cell.image
          img.style.cssText = 'max-width: 100%; height: auto; display: block;'
          cellContent.appendChild(img)
        } else if (cell && cell.type === 'image') {
          const img = document.createElement('img')
          img.src = cell.data?.file?.url || cell.url
          img.style.cssText = 'max-width: 100%; height: auto; display: block;'
          cellContent.appendChild(img)
        }

        cellContent.addEventListener('blur', () => {
          const content = cellContent.innerHTML
          if (this.data.content && this.data.content[rowIndex]) {
            this.data.content[rowIndex][cellIndex] = content
          }
        })

        const actionButtons = document.createElement('div')
        actionButtons.style.cssText = 'position: absolute; top: 0; right: 0; opacity: 0; transition: opacity 0.2s;'

        const imageBtn = document.createElement('button')
        imageBtn.innerHTML = '🖼️'
        imageBtn.style.cssText =
          'padding: 4px 8px; background: #f0f0f0; border: 1px solid #ccc; cursor: pointer; font-size: 12px;'
        imageBtn.type = 'button'
        imageBtn.onclick = (e) => {
          e.preventDefault()
          this.openImageUploader(rowIndex, cellIndex, cellContent)
        }

        actionButtons.appendChild(imageBtn)
        td.appendChild(cellContent)
        td.appendChild(actionButtons)

        td.addEventListener('mouseenter', () => {
          actionButtons.style.opacity = '1'
        })

        td.addEventListener('mouseleave', () => {
          actionButtons.style.opacity = '0'
        })

        tr.appendChild(td)
      })
      table.appendChild(tr)
    })

    const controls = document.createElement('div')
    controls.style.cssText = 'margin-top: 10px; display: flex; gap: 10px;'

    const addRowBtn = document.createElement('button')
    addRowBtn.textContent = '+ Add Row'
    addRowBtn.style.cssText =
      'padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;'
    addRowBtn.type = 'button'
    addRowBtn.onclick = () => this.addRow(table)

    const addColBtn = document.createElement('button')
    addColBtn.textContent = '+ Add Column'
    addColBtn.style.cssText =
      'padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;'
    addColBtn.type = 'button'
    addColBtn.onclick = () => this.addColumn(table)

    controls.appendChild(addRowBtn)
    controls.appendChild(addColBtn)

    wrapper.appendChild(table)
    wrapper.appendChild(controls)

    return wrapper
  }

  private openImageUploader(rowIndex: number, cellIndex: number, cellContent: HTMLElement) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const response = await uploadFile(file)
          if (response.code === 200 && response.data?.url) {
            const img = document.createElement('img')
            img.src = response.data.url
            img.style.cssText = 'max-width: 100%; height: auto; display: block;'

            cellContent.innerHTML = ''
            cellContent.appendChild(img)

            // Initialize content if it doesn't exist
            if (!this.data.content) {
              this.data.content = [
                ['', ''],
                ['', ''],
              ]
            }

            // Ensure row exists
            if (!this.data.content[rowIndex]) {
              this.data.content[rowIndex] = []
            }

            this.data.content[rowIndex][cellIndex] = {
              type: 'image',
              data: { file: { url: response.data.url } },
            }
          }
        } catch (error) {
          console.error('Error uploading image:', error)
        }
      }
    }
    input.click()
  }

  private addRow(table: HTMLTableElement) {
    // Initialize content if it doesn't exist
    if (!this.data.content) {
      this.data.content = [
        ['', ''],
        ['', ''],
      ]
    }

    const rowCount = this.data.content.length
    const colCount = this.data.content[0]?.length || 2

    const newRow = Array(colCount).fill('')
    this.data.content.push(newRow)

    const tr = document.createElement('tr')
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td')
      td.style.cssText = 'border: 1px solid #ddd; padding: 8px; min-width: 100px; min-height: 40px;'
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.style.cssText = 'min-height: 20px; outline: none;'
      div.addEventListener('blur', () => {
        if (newRow) {
          newRow[i] = div.innerHTML
        }
      })
      td.appendChild(div)
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }

  private addColumn(table: HTMLTableElement) {
    // Initialize content if it doesn't exist
    if (!this.data.content) {
      this.data.content = [
        ['', ''],
        ['', ''],
      ]
    }

    this.data.content.forEach((row: any[]) => {
      row.push('')
    })

    const rows = table.querySelectorAll('tr')
    rows.forEach((tr: HTMLTableRowElement) => {
      const td = document.createElement('td')
      td.style.cssText = 'border: 1px solid #ddd; padding: 8px; min-width: 100px; min-height: 40px;'
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.style.cssText = 'min-height: 20px; outline: none;'
      td.appendChild(div)
      tr.appendChild(td)
    })
  }

  save() {
    return {
      content: this.data.content,
    }
  }

  static get pasteConfig() {
    return {
      tags: ['TABLE'],
    }
  }

  onPaste(event: any) {
    const table = event.detail.data
    const rows: any[] = []
    table.querySelectorAll('tr').forEach((tr: HTMLTableRowElement) => {
      const cells: any[] = []
      tr.querySelectorAll('td, th').forEach((td: Element) => {
        cells.push((td as HTMLTableCellElement).innerHTML)
      })
      rows.push(cells)
    })
    this.data = { content: rows }
  }
}

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
        table: CustomTable as any,
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
