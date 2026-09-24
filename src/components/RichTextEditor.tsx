'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Quote, Link2, ImagePlus, RemoveFormatting } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeRichText } from '@/lib/rich-text';

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

async function imageToDataUrl(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) throw new Error('Chỉ hỗ trợ ảnh PNG, JPG, WebP hoặc GIF.');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    for (const maxSide of [1400, 1100, 850]) {
      const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Không thể xử lý ảnh này.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/webp', maxSide === 1400 ? 0.82 : 0.7);
      if (dataUrl.length <= 1_400_000) return dataUrl;
    }
    throw new Error('Ảnh quá lớn để lưu trên trình duyệt. Vui lòng chọn ảnh nhỏ hơn.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function RichTextEditor({ name, defaultValue = '', placeholder = 'Nhập nội dung...', required }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<Range | null>(null);

  useEffect(() => {
    const safe = sanitizeRichText(defaultValue);
    if (editorRef.current) editorRef.current.innerHTML = safe;
    if (valueRef.current) valueRef.current.value = safe;
  }, [defaultValue]);

  const syncValue = () => {
    if (editorRef.current && valueRef.current) valueRef.current.value = editorRef.current.innerHTML;
  };

  const insertHtml = (html: string, savedRange?: Range | null) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    const currentRange = savedRange || (selection?.rangeCount ? selection.getRangeAt(0) : null);
    const range = currentRange && editor.contains(currentRange.commonAncestorContainer) ? currentRange : document.createRange();
    if (!currentRange || !editor.contains(currentRange.commonAncestorContainer)) {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode && selection) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    syncValue();
  };

  const insertImage = async (file: File, range?: Range | null) => {
    try {
      const src = await imageToDataUrl(file);
      if ((editorRef.current?.innerHTML.length || 0) + src.length > 2_500_000) throw new Error('Nội dung có quá nhiều ảnh để lưu trên trình duyệt. Vui lòng dùng ảnh nhỏ hơn.');
      insertHtml(`<img src="${src}" alt="Hình ảnh trong nội dung">`, range);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thêm ảnh.');
    }
  };

  const format = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncValue();
  };

  const addLink = () => {
    const selection = window.getSelection();
    selectionRef.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    const url = window.prompt('Nhập liên kết (https://...):');
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Liên kết phải bắt đầu bằng http:// hoặc https://.');
      return;
    }
    if (selectionRef.current && editorRef.current?.contains(selectionRef.current.commonAncestorContainer)) {
      selection?.removeAllRanges();
      selection?.addRange(selectionRef.current);
    }
    format('createLink', url);
  };

  const toolbar = [
    { label: 'In đậm', icon: Bold, run: () => format('bold') },
    { label: 'In nghiêng', icon: Italic, run: () => format('italic') },
    { label: 'Gạch chân', icon: Underline, run: () => format('underline') },
    { label: 'Tiêu đề', icon: Heading2, run: () => format('formatBlock', 'h2') },
    { label: 'Danh sách', icon: List, run: () => format('insertUnorderedList') },
    { label: 'Danh sách số', icon: ListOrdered, run: () => format('insertOrderedList') },
    { label: 'Trích dẫn', icon: Quote, run: () => format('formatBlock', 'blockquote') },
    { label: 'Liên kết', icon: Link2, run: addLink },
    { label: 'Xóa định dạng', icon: RemoveFormatting, run: () => format('removeFormat') },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] bg-[var(--card-bg)] p-2">
        {toolbar.map(({ label, icon: Icon, run }) => (
          <button key={label} type="button" title={label} aria-label={label} onMouseDown={event => event.preventDefault()} onClick={run} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="mx-1 w-px bg-[var(--border-color)]" />
        <button type="button" title="Chèn ảnh" aria-label="Chèn ảnh" onMouseDown={event => event.preventDefault()} onClick={() => { const selection = window.getSelection(); selectionRef.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null; fileRef.current?.click(); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"><ImagePlus className="h-4 w-4" /></button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void insertImage(file, selectionRef.current); event.target.value = ''; }} />
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label={placeholder} aria-multiline="true" aria-required={required} onInput={syncValue} onPaste={event => {
        const image = Array.from(event.clipboardData.files).find(file => file.type.startsWith('image/'));
        if (image) {
          event.preventDefault();
          const selection = window.getSelection();
          void insertImage(image, selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null);
          return;
        }
        event.preventDefault();
        const html = event.clipboardData.getData('text/html');
        const text = event.clipboardData.getData('text/plain');
        if (html) insertHtml(sanitizeRichText(html));
        else if (text) insertHtml(text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>'));
      }} onDrop={event => { const image = Array.from(event.dataTransfer.files).find(file => file.type.startsWith('image/')); if (image) { event.preventDefault(); const range = document.caretRangeFromPoint(event.clientX, event.clientY); void insertImage(image, range?.cloneRange()); } }} className="min-h-64 w-full px-5 py-4 text-base leading-7 outline-none whitespace-pre-wrap [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-6 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc" />
      <input ref={valueRef} type="hidden" name={name} defaultValue={defaultValue} />
      <p className="border-t border-[var(--border-color)] px-4 py-2 text-xs text-[var(--muted-fg)]">{placeholder} · Dán hoặc kéo thả ảnh trực tiếp vào nội dung.</p>
    </div>
  );
}

export function RichTextContent({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.innerHTML = sanitizeRichText(html);
  }, [html]);
  return <div ref={contentRef} className="whitespace-pre-wrap leading-7 [&_img]:my-3 [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-lg [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc" />;
}
