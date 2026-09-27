'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Blockquote from '@tiptap/extension-blockquote';
import { Bold, Italic, Quote, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  label: string;
  required?: boolean;
}

export default function TiptapEditor({ value, onChange, label, required }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'w-full rounded-2xl my-6 object-cover shadow-sm',
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-[#0096b1] underline font-medium',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-[#0096b1] pl-4 py-2 italic text-gray-700 bg-gray-50 rounded-r-xl my-4',
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  // Загрузка картинки в Vercel Blob и вставка в текст
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || 'Ошибка загрузки изображения');
      }
    } catch {
      alert('Ошибка соединения с сервером');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const setLink = () => {
    const url = prompt('Введите URL ссылки:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700 uppercase">
        {label} {required && '*'}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Панель инструментов */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-2 rounded-t-xl border border-b-0 border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-gray-700 transition cursor-pointer ${
            editor.isActive('bold') ? 'bg-white shadow-sm text-[#0096b1] font-bold' : 'hover:bg-white'
          }`}
          title="Жирный"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-gray-700 transition cursor-pointer ${
            editor.isActive('italic') ? 'bg-white shadow-sm text-[#0096b1]' : 'hover:bg-white'
          }`}
          title="Курсив"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-gray-700 transition cursor-pointer ${
            editor.isActive('blockquote') ? 'bg-white shadow-sm text-[#0096b1]' : 'hover:bg-white'
          }`}
          title="Цитата"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 hover:bg-white rounded-lg text-gray-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
          title="Вставить картинку"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#0096b1]" /> : <ImageIcon className="w-4 h-4" />}
          <span className="text-xs font-medium">Картинка</span>
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg text-gray-700 transition cursor-pointer ${
            editor.isActive('link') ? 'bg-white shadow-sm text-[#0096b1]' : 'hover:bg-white'
          }`}
          title="Ссылка"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Область редактирования */}
      <div className="bg-white border border-gray-300 rounded-b-xl p-4 min-h-[220px] text-sm text-gray-900 focus-within:border-[#0096b1] transition">
        <EditorContent editor={editor} className="prose max-w-none focus:outline-none min-h-[200px]" />
      </div>
    </div>
  );
}