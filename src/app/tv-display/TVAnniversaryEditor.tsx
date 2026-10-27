'use client';

import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import ImageUpload from '@/components/ImageUpload';
import { defaultTVAnniversary, type TVAnniversarySettings, type TVAnniversarySlideConfig } from '@/lib/tv-anniversary-settings';

export default function TVAnniversaryEditor({ value, onChange, imageKey }: {
  value: TVAnniversarySettings; onChange: (value: TVAnniversarySettings) => void; imageKey: number;
}) {
  const update = (patch: Partial<TVAnniversarySettings>) => onChange({ ...value, ...patch });
  const slide = (id: string, patch: Partial<TVAnniversarySlideConfig>) => update({ slides: value.slides.map(item => item.id === id ? {...item,...patch} : item) });
  const move = (index: number, direction: number) => {
    const slides = [...value.slides];
    [slides[index], slides[index + direction]] = [slides[index + direction], slides[index]];
    update({slides});
  };
  const field = 'space-y-2';
  const label = 'text-sm font-semibold';
  const previewUrl = (url: string) => url.startsWith('/')
    ? new URL(url,process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://xeluottoantrung.com').href : url;
  return <section className="space-y-6 rounded-2xl border border-amber-500/30 bg-[var(--card-bg)] p-5 sm:p-6" aria-labelledby="tv-anniversary-title">
    <div><h2 id="tv-anniversary-title" className="flex items-center gap-2 text-lg font-semibold"><Sparkles size={20} className="text-amber-500"/>Kỷ niệm 4 năm · 2022–2026</h2>
      <p className="mt-2 text-sm text-[var(--muted-fg)]">Chỉ áp dụng cho giao diện kỷ niệm. Hết sự kiện, chọn “Bình thường” ở trên và lưu; nội dung bên dưới vẫn được giữ lại.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {([['confetti','Confetti trong header'],['silk','Lụa vàng chuyển động'],['sparkles','Điểm sáng quanh huy hiệu'],['gratitude','Lời tri ân ở footer']] as const).map(([key,text]) =>
        <label key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-3 text-sm"><input id={`tv-event-${key}`} type="checkbox" checked={value[key]} onChange={event=>update({[key]:event.target.checked})} className="h-4 w-4 accent-red-600"/>{text}</label>)}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {value.messages.map((text,index)=><div key={index} className={field}><div className="flex items-center justify-between gap-2"><label className={label} htmlFor={`tv-event-message-${index}`}>Lời tri ân {index+1}</label>
        <Button type="button" variant="ghost" disabled={value.messages.length===1} aria-label={`Xóa lời tri ân ${index+1}`} onClick={()=>update({messages:value.messages.filter((_,i)=>i!==index)})}><Trash2 size={15}/></Button></div>
        <Input id={`tv-event-message-${index}`} required maxLength={100} value={text} onChange={event=>update({messages:value.messages.map((item,i)=>i===index?event.target.value:item)})}/></div>)}
      <div className={field}><label className={label} htmlFor="tv-event-message-seconds">Tốc độ chữ chạy</label>
        <select id="tv-event-message-seconds" value={value.messageSeconds} onChange={event=>update({messageSeconds:Number(event.target.value)})} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-3 text-sm">
          <option value={14}>Chậm</option><option value={9}>Vừa</option><option value={5}>Nhanh</option>
          {![5,9,14].includes(value.messageSeconds) && <option value={value.messageSeconds}>Tốc độ đã lưu</option>}
        </select><p className="text-sm text-[var(--muted-fg)]">Chữ chạy đều sang trái và nối tiếp liên tục. Chọn “Vừa” để dễ đọc trên TV.</p></div>
    </div>
    <div className="space-y-2"><Button type="button" variant="secondary" disabled={value.messages.length>=5} onClick={()=>update({messages:[...value.messages,'']})}><Plus size={16}/>Thêm lời tri ân</Button>
      <p className="text-sm text-[var(--muted-fg)]">Từ 1 đến 5 lời tri ân, tối đa 100 ký tự mỗi câu. Hiển thị theo thứ tự nhập, ngăn cách bằng điểm nhấn vàng.</p></div>
    <div className="border-t border-[var(--border-color)] pt-5">
      <label className="flex items-center gap-3 font-semibold"><input id="tv-event-slide-enabled" type="checkbox" checked={value.slideEnabled} onChange={event=>update({slideEnabled:event.target.checked})} className="h-4 w-4 accent-red-600"/>Chèn slide tri ân giữa các lượt xe</label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={field}><label className={label} htmlFor="tv-event-pages">Chèn sau mỗi bao nhiêu trang xe</label><Input id="tv-event-pages" type="number" min={1} max={30} required value={value.pagesBetweenSlides} onChange={event=>update({pagesBetweenSlides:Number(event.target.value)})}/></div>
        <div className={field}><label className={label} htmlFor="tv-event-slide-seconds">Thời gian mỗi slide tri ân (giây)</label><Input id="tv-event-slide-seconds" type="number" min={5} max={60} required value={value.slideSeconds} onChange={event=>update({slideSeconds:Number(event.target.value)})}/></div>
      </div>
      <p className="mt-3 text-sm text-[var(--muted-fg)]">Mỗi lần chèn chỉ hiện một slide, luân phiên theo thứ tự bên dưới. Slide tắt hoặc thiếu ảnh sẽ được bỏ qua; ảnh lỗi không chặn xe.</p>
    </div>
    <div className="space-y-4">
      {value.slides.map((item,index)=><article key={item.id} data-event-slide-id={item.id} className="space-y-4 rounded-xl border border-[var(--border-color)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={item.enabled} onChange={event=>slide(item.id,{enabled:event.target.checked})} className="h-4 w-4 accent-red-600"/>Slide tri ân {index+1}</label>
          <div className="flex gap-1"><Button type="button" variant="ghost" aria-label={`Đưa slide ${index+1} lên`} disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={16}/></Button>
            <Button type="button" variant="ghost" aria-label={`Đưa slide ${index+1} xuống`} disabled={index===value.slides.length-1} onClick={()=>move(index,1)}><ArrowDown size={16}/></Button>
            <Button type="button" variant="danger" aria-label={`Xóa slide ${index+1}`} onClick={()=>update({slides:value.slides.filter(row=>row.id!==item.id)})}><Trash2 size={16}/></Button></div></div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><div className={field}><p className={label}>Ảnh showroom · Slide {index+1}</p>
          <ImageUpload key={`${imageKey}:${item.id}`} name={`anniversary-image-${item.id}`} existing={previewUrl(item.imageUrl)} hint="Nhấn × để thay hoặc bỏ ảnh. Dùng ảnh thật của showroom; bỏ ảnh sẽ tạm ngừng slide này."/></div>
          <div className="space-y-4"><div className={field}><label className={label} htmlFor={`tv-slide-title-${item.id}`}>Tiêu đề slide {index+1}</label><Input id={`tv-slide-title-${item.id}`} required maxLength={60} value={item.title} onChange={event=>slide(item.id,{title:event.target.value})}/></div>
            <div className={field}><label className={label} htmlFor={`tv-slide-highlight-${item.id}`}>Dòng nổi bật slide {index+1}</label><Input id={`tv-slide-highlight-${item.id}`} required maxLength={60} value={item.highlight} onChange={event=>slide(item.id,{highlight:event.target.value})}/></div>
            <div className={field}><label className={label} htmlFor={`tv-slide-body-${item.id}`}>Lời cảm ơn slide {index+1}</label><Input id={`tv-slide-body-${item.id}`} required maxLength={240} value={item.body} onChange={event=>slide(item.id,{body:event.target.value})}/></div></div></div>
      </article>)}
      <Button type="button" variant="secondary" disabled={value.slides.length>=6} onClick={()=>update({slides:[...value.slides,{...defaultTVAnniversary.slides[0],id:crypto.randomUUID(),imageUrl:''}]})}><Plus size={16}/>Thêm slide tri ân</Button>
      <p className="text-sm text-[var(--muted-fg)]">Tối đa 6 slide. Huy hiệu 4 năm và niên hạn 2022–2026 được giữ cố định cho sự kiện này.</p>
    </div>
  </section>;
}
