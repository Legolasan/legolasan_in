'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'video'],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['clean'],
        ],
        handlers: {
          image: function (this: any) {
            const input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.setAttribute('accept', 'image/*')
            input.click()

            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return

              const formData = new FormData()
              formData.append('file', file)

              try {
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                })

                if (response.ok) {
                  const data = await response.json()
                  // Access Quill editor through the handler's context
                  const quill = this.quill
                  if (quill) {
                    const range = quill.getSelection()
                    const index = range ? range.index : 0
                    quill.insertEmbed(index, 'image', data.url)
                  }
                } else {
                  alert('Failed to upload image')
                }
              } catch (error) {
                console.error('Error uploading image:', error)
                alert('Error uploading image')
              }
            }
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  )

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'color',
    'background',
    'align',
  ]

  return (
    <div className="bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Start writing...'}
        className="bg-white"
      />
    </div>
  )
}

