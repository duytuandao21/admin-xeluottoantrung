'use client';
/* eslint-disable @next/next/no-img-element -- Admin displays the original uploaded assets. */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ExternalLink, ImagePlus, ArrowUp, ArrowDown, Plus, Save, Trash2, LayoutTemplate, Flag, Quote, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api/client';
import { PageHeader, Button, Input, Textarea, Select } from '@/components/ui';
import { addAboutAsset, chapterKeys, chapterNames, deleteAboutItem, getAboutContent, reorderAboutItems, saveMilestone, saveSection, saveStory, updateAboutAsset, type AboutContent, type ChapterKey, type Milestone, type Section, type Story, type StoryAsset } from '@/lib/api/about-story';
import { may, milestoneProblem, sectionProblem, storyProblem } from '@/lib/about-story-rules';

const panel = 'rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]';
const muted = 'text-sm text-[var(--muted-fg)]';
const icons = [LayoutTemplate, Flag, Quote, Users, ArrowRight];
const stages = ['1997-2017', '2018-2022', '2024-2025', '2026'] as const;
const emptyMilestone: Omit<Milestone, 'id'> = { slug:'', periodLabel:'', eventDate:null, stage:'2026', title:'', summary:'', body:null, featured:false, sortOrder:0, sourceNote:null };
const emptyStory: Omit<Story, 'id'> = { title:'', body:'', quote:null, displayName:null, sortOrder:0 };
type Runner = (task: () => Promise<unknown>, message: string, ownForm?: boolean) => Promise<boolean>;
type Common = { content:AboutContent; can:(permission:string)=>boolean; run:Runner; dirty:(key:string,value:boolean)=>void };

function Field({label,value,onChange,multiline=false,required=false,maxLength,type='text'}:{label:string;value:string;onChange:(value:string)=>void;multiline?:boolean;required?:boolean;maxLength?:number;type?:string}) {
  const id=useId();
  const props={id,value,required,maxLength,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>onChange(e.target.value)};
  return <div className="space-y-2"><label htmlFor={id} className="text-sm font-semibold">{label}{required&&<span aria-hidden="true" className="ml-1 text-red-500">*</span>}</label>{multiline?<Textarea {...props} rows={4}/>:<Input {...props} type={type}/>}</div>;
}
function Choice({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[]}) {
  const id=useId();
  return <div className="space-y-2"><label htmlFor={id} className="text-sm font-semibold">{label}</label><Select id={id} value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>;
}
const placements=[{value:'desktop',label:'Ảnh chính / Desktop'},{value:'mobile',label:'Ảnh riêng Mobile'},{value:'gallery',label:'Ảnh bổ sung'}];

function Images({ownerType,ownerKey,content,can,run,dirty}:Common&{ownerType:StoryAsset['ownerType'];ownerKey:string}) {
  const assets=content.assets.filter(a=>a.ownerType===ownerType&&a.ownerKey===ownerKey);
  const [file,setFile]=useState<File|null>(null),[alt,setAlt]=useState(''),[placement,setPlacement]=useState<StoryAsset['placement']>('desktop'),[edit,setEdit]=useState<StoryAsset|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const orderKey='assetOrder:'+ownerType+':'+ownerKey;
  const [orderedIds,setOrderedIds]=useState(()=>content.assets.map(a=>a.id));
  const displayedAssets=[...assets].sort((a,b)=>orderedIds.indexOf(a.id)-orderedIds.indexOf(b.id));
  const orderChanged=orderedIds.some((id,index)=>id!==content.assets[index]?.id);
  const move=(index:number,direction:number)=>{if(edit||file){toast.error('Hãy hoàn tất chỉnh sửa ảnh trước khi sắp xếp.');return;}const other=displayedAssets[index+direction];if(!other)return;const ids=[...orderedIds],from=ids.indexOf(displayedAssets[index].id),to=ids.indexOf(other.id);[ids[from],ids[to]]=[ids[to],ids[from]];setOrderedIds(ids);dirty(orderKey,ids.some((id,i)=>id!==content.assets[i]?.id));};
  const saveOrder=async()=>{if(await run(()=>reorderAboutItems('asset',orderedIds,content.revision),'Đã áp dụng thứ tự ảnh.',true))dirty(orderKey,false);};
  return <section className={`${panel} mt-6 p-5 sm:p-6`}><div className="mb-5 flex items-start gap-3"><span className="rounded-xl bg-red-500/10 p-3 text-red-600"><ImagePlus size={21}/></span><div><h3 className="font-semibold">Hình ảnh</h3><p className={`${muted} mt-1`}>Ảnh chính dùng trên desktop. Có thể thêm ảnh riêng cho mobile để bố cục đẹp hơn.</p></div></div>
    {assets.length>0&&<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{displayedAssets.map((a,index)=><div key={a.id} className="overflow-hidden rounded-xl border border-[var(--border-color)]"><div className="relative bg-[var(--muted)] p-2"><img src={a.publicUrl} alt={a.altText} className="h-40 w-full rounded-lg object-contain"/></div><div className="space-y-3 p-3"><p title={a.altText} className="line-clamp-2 break-all text-sm font-medium">{a.altText}</p><p className={muted}>{placements.find(p=>p.value===a.placement)?.label} · {a.width} × {a.height}</p><div className="flex flex-wrap gap-1">{can('content.update')&&<><Button type="button" variant="secondary" size="sm" onClick={()=>{setEdit(a);dirty('image',true);}}>Sửa</Button><Button type="button" variant="ghost" size="sm" aria-label={`Đưa ảnh ${a.altText} lên`} disabled={index===0} onClick={()=>void move(index,-1)}><ArrowUp size={15}/></Button><Button type="button" variant="ghost" size="sm" aria-label={`Đưa ảnh ${a.altText} xuống`} disabled={index===assets.length-1} onClick={()=>void move(index,1)}><ArrowDown size={15}/></Button></>}{can('content.delete')&&<Button type="button" variant="ghost" size="sm" aria-label={`Xóa ảnh ${a.altText}`} onClick={()=>{if(window.confirm('Xóa ảnh này khỏi trang Giới thiệu?'))void run(()=>deleteAboutItem('assets',a.id,content.revision),'Đã xóa ảnh.');}}><Trash2 size={16}/></Button>}</div></div></div>)}</div>}
    {orderChanged&&<div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>Có thay đổi thứ tự ảnh chưa lưu.</span><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" onClick={()=>{setOrderedIds(content.assets.map(a=>a.id));dirty(orderKey,false);}}>Hủy</Button><Button type="button" size="sm" onClick={()=>void saveOrder()}><Save size={15}/>Lưu thứ tự</Button></div></div>}
    {edit&&<form className="mt-5 grid gap-4 rounded-xl bg-[var(--muted)] p-4 sm:grid-cols-2" onSubmit={async e=>{e.preventDefault();if(await run(()=>updateAboutAsset(edit,content.revision),'Đã áp dụng thông tin ảnh.',true)){setEdit(null);dirty('image',false);}}}><Field label="Mô tả ảnh" value={edit.altText} required maxLength={300} onChange={v=>setEdit({...edit,altText:v})}/><Choice label="Vị trí hiển thị" value={edit.placement} options={placements} onChange={v=>setEdit({...edit,placement:v as StoryAsset['placement']})}/><div className="flex gap-2 sm:col-span-2"><Button><Save size={16}/>Áp dụng</Button><Button type="button" variant="secondary" onClick={()=>{setEdit(null);dirty('image',false);}}>Hủy</Button></div></form>}
    {can('content.create')&&<form className="mt-5 grid gap-4 rounded-xl border border-dashed border-[var(--input-border)] bg-[var(--muted)] p-4 sm:grid-cols-2" onSubmit={async e=>{e.preventDefault();if(!file)return;if(await run(()=>addAboutAsset(file,ownerType,ownerKey,placement,alt,content.assets.length,content.revision),'Đã thêm ảnh lên website.',true)){setFile(null);setAlt('');dirty('upload',false);if(fileRef.current)fileRef.current.value='';}}}>
      <div className="space-y-2"><label htmlFor={`upload-${ownerKey}`} className="text-sm font-semibold">Thêm ảnh</label><Input id={`upload-${ownerKey}`} ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{setFile(e.target.files?.[0]??null);dirty('upload',Boolean(e.target.files?.length));}}/><p className={muted}>JPG, PNG, WebP hoặc AVIF · tối đa 10 MB</p></div><Choice label="Vị trí hiển thị" value={placement} options={placements} onChange={v=>setPlacement(v as StoryAsset['placement'])}/><Field label="Mô tả ảnh" value={alt} onChange={setAlt} maxLength={300} required/><div className="flex items-end"><Button disabled={!file||!alt.trim()}><ImagePlus size={17}/>Tải ảnh và áp dụng</Button></div>
    </form>}
  </section>;
}
function SectionForm({section,content,can,run,dirty}:Common&{section:Section}) {
  const [form,setForm]=useState(section),[changed,setChanged]=useState(false);
  const change=(part:Partial<Section>)=>{setForm(old=>({...old,...part}));setChanged(true);dirty('section',true);};
  return <form className={`${panel} p-5 sm:p-7`} onSubmit={async e=>{e.preventDefault();const issue=sectionProblem(form);if(issue){toast.error(issue);return;}const {title,subtitle,body,ctaLabel,ctaHref,visible}=form;if(await run(()=>saveSection(section.chapterKey,{title,subtitle,body,ctaLabel,ctaHref,visible},content.revision),'Đã áp dụng nội dung lên website.',true)){setChanged(false);dirty('section',false);}}}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Nội dung {chapterNames[chapterKeys.indexOf(section.chapterKey)].toLowerCase()}</h2><p className={`${muted} mt-1`}>Chỉnh nội dung rồi áp dụng để cập nhật website.</p></div><label className="flex cursor-pointer items-center gap-2 text-sm"><input className="h-4 w-4 accent-red-600" type="checkbox" checked={form.visible} onChange={e=>change({visible:e.target.checked})}/>Hiển thị phần này</label></div>
    <fieldset disabled={!can('content.update')} className="grid gap-5 md:grid-cols-2"><Field label="Tiêu đề" value={form.title} onChange={v=>change({title:v})} required maxLength={240}/><Field label="Mô tả ngắn" value={form.subtitle??''} onChange={v=>change({subtitle:v})} maxLength={400}/><div className="md:col-span-2"><Field label="Nội dung" value={form.body??''} onChange={v=>change({body:v})} multiline maxLength={10000}/></div><Field label="Tên nút liên kết" value={form.ctaLabel??''} onChange={v=>change({ctaLabel:v})} maxLength={120}/><Field label="Đường dẫn trên website" value={form.ctaHref??''} onChange={v=>change({ctaHref:v})} maxLength={300}/></fieldset>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-5"><span className={muted}>{changed?'Có thay đổi chưa áp dụng':'Nội dung đang hiển thị trên website'}</span><div className="flex gap-2">{changed&&<Button type="button" variant="secondary" onClick={()=>{setForm(section);setChanged(false);dirty('section',false);}}>Hủy thay đổi</Button>}<Button disabled={!changed||!can('content.update')}><Save size={17}/>Áp dụng thay đổi</Button></div></div>
  </form>;
}
function Records({kind,content,can,run,dirty}:Common&{kind:'milestone'|'story'}) {
  const rows=kind==='milestone'?content.milestones:content.stories;
  const orderKey='recordOrder:'+kind;
  const [orderedIds,setOrderedIds]=useState(()=>rows.map(r=>r.id));
  const orderedRows=[...rows].sort((a,b)=>orderedIds.indexOf(a.id)-orderedIds.indexOf(b.id));
  const orderChanged=orderedIds.some((id,index)=>id!==rows[index]?.id);
  const saveOrder=async()=>{if(await run(()=>reorderAboutItems(kind,orderedIds,content.revision),'Đã áp dụng thứ tự.',true))dirty(orderKey,false);};
  const [selected,setSelected]=useState<string|null>(null),[form,setForm]=useState<Omit<Milestone,'id'>|Omit<Story,'id'>|null>(null),[changed,setChanged]=useState(false);
  const active=rows.find(r=>r.id===selected);
  const change=(part:Record<string,unknown>)=>{setForm(old=>old?{...old,...part}:old);setChanged(true);dirty('record',true);};
  const choose=(row:Milestone|Story|null)=>{if(orderChanged){toast.error('Hãy lưu hoặc hủy thứ tự trước.');return;}if(changed&&!window.confirm('Bỏ thay đổi chưa áp dụng?'))return;setSelected(row?.id??null);setForm(row?{...row}:{...(kind==='milestone'?emptyMilestone:emptyStory),sortOrder:rows.length});setChanged(false);dirty('record',false);};
  const move=(index:number,direction:number)=>{if(changed){toast.error('Hãy hoàn tất chỉnh sửa nội dung trước khi sắp xếp.');return;}if(!orderedRows[index+direction])return;const ids=[...orderedIds];[ids[index],ids[index+direction]]=[ids[index+direction],ids[index]];setOrderedIds(ids);dirty(orderKey,ids.some((id,i)=>id!==rows[i]?.id));};
  return <section className={`${panel} mt-6 p-5 sm:p-6`}><div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">{kind==='milestone'?'Các cột mốc':'Câu chuyện khách hàng'} <span className="ml-1 text-sm text-[var(--muted-fg)]">({rows.length})</span></h3><p className={`${muted} mt-1`}>Chọn một mục để chỉnh sửa hoặc thêm nội dung mới.</p></div>{can('content.create')&&<Button type="button" size="sm" onClick={()=>choose(null)}><Plus size={17}/>Thêm mới</Button>}</div>
    <div className={`grid gap-5 ${form?'xl:grid-cols-[260px_minmax(0,1fr)]':''}`}><div><ol className="space-y-2">{orderedRows.map((row,index)=><li key={row.id} className={`flex items-center gap-2 rounded-xl border p-3 ${selected===row.id?'border-red-400 bg-red-500/5':'border-[var(--border-color)]'}`}><button type="button" onClick={()=>choose(row)} className="min-w-0 flex-1 text-left"><span className={muted+' admin-list-text'} title={kind==='milestone'?(row as Milestone).periodLabel:undefined}>{kind==='milestone'?(row as Milestone).periodLabel:`Câu chuyện ${index+1}`}</span><span className="admin-list-text mt-1 block text-sm font-semibold" title={row.title}>{row.title}</span></button><div className="flex shrink-0 gap-1"><button type="button" className="rounded-lg p-1.5 hover:bg-[var(--muted)] disabled:opacity-30" aria-label={`Đưa ${row.title} lên`} disabled={index===0||!can('content.update')} onClick={()=>void move(index,-1)}><ArrowUp size={15}/></button><button type="button" className="rounded-lg p-1.5 hover:bg-[var(--muted)] disabled:opacity-30" aria-label={`Đưa ${row.title} xuống`} disabled={index===rows.length-1||!can('content.update')} onClick={()=>void move(index,1)}><ArrowDown size={15}/></button></div></li>)}</ol>{orderChanged&&<div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>Có thay đổi thứ tự chưa lưu.</span><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" onClick={()=>{setOrderedIds(rows.map(r=>r.id));dirty(orderKey,false);}}>Hủy</Button><Button type="button" size="sm" onClick={()=>void saveOrder()}><Save size={15}/>Lưu thứ tự</Button></div></div>}</div>
    {form&&<div><form className="space-y-5 rounded-xl border border-[var(--border-color)] p-4 sm:p-5" onSubmit={async e=>{e.preventDefault();const issue=kind==='milestone'?milestoneProblem(form as Milestone):storyProblem(form as Story);if(issue){toast.error(issue);return;}const values={...form};delete (values as Partial<Milestone>).id;const task=()=>kind==='milestone'?saveMilestone(values as Omit<Milestone,'id'>,content.revision,active?.id):saveStory(values as Omit<Story,'id'>,content.revision,active?.id);if(await run(task,'Đã áp dụng lên website.',true)){setForm(null);setChanged(false);dirty('record',false);}}}>
      <h3 className="font-semibold">{active?'Chỉnh sửa':'Thêm'} {kind==='milestone'?'cột mốc':'câu chuyện'}</h3><fieldset disabled={active?!can('content.update'):!can('content.create')} className="grid gap-4 md:grid-cols-2">
      {kind==='milestone'&&<><Field label="Mã đường dẫn" value={(form as Milestone).slug} onChange={v=>change({slug:v})} required maxLength={100}/><Field label="Nhãn thời gian" value={(form as Milestone).periodLabel} onChange={v=>change({periodLabel:v})} required maxLength={40}/><Choice label="Giai đoạn" value={(form as Milestone).stage} options={stages.map(v=>({value:v,label:v}))} onChange={v=>change({stage:v})}/><Field label="Ngày chính xác (nếu có)" type="date" value={(form as Milestone).eventDate??''} onChange={v=>change({eventDate:v||null})}/></>}
      <div className="md:col-span-2"><Field label="Tiêu đề" value={form.title} onChange={v=>change({title:v})} required maxLength={240}/></div>
      {kind==='milestone'?<><div className="md:col-span-2"><Field label="Tóm tắt" value={(form as Milestone).summary} onChange={v=>change({summary:v})} required multiline maxLength={800}/></div><label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" className="h-4 w-4 accent-red-600" checked={(form as Milestone).featured} onChange={e=>change({featured:e.target.checked})}/>Nhấn mạnh cột mốc này</label></>:<><Field label="Tên khách hàng hiển thị (tùy chọn)" value={(form as Story).displayName??''} onChange={v=>change({displayName:v})} maxLength={160}/><Field label="Trích dẫn (tùy chọn)" value={(form as Story).quote??''} onChange={v=>change({quote:v})} maxLength={2000}/></>}
      <div className="md:col-span-2"><Field label="Nội dung" value={form.body??''} onChange={v=>change({body:v})} multiline required={kind==='story'} maxLength={10000}/></div></fieldset>
      <div className="flex flex-wrap gap-2"><Button disabled={active?!can('content.update'):!can('content.create')}><Save size={16}/>Áp dụng thay đổi</Button><Button type="button" variant="secondary" onClick={()=>{if(changed&&!window.confirm('Bỏ thay đổi chưa áp dụng?'))return;setForm(null);setChanged(false);dirty('record',false);}}>Đóng</Button>{active&&can('content.delete')&&<Button type="button" variant="ghost" onClick={async()=>{if(window.confirm('Xóa nội dung này và ảnh đi kèm khỏi trang Giới thiệu?'))if(await run(()=>deleteAboutItem(kind==='milestone'?'milestones':'stories',active.id,content.revision),'Đã xóa nội dung.',true)){setForm(null);setChanged(false);dirty('record',false);}}}><Trash2 size={16}/>Xóa</Button>}</div>
    </form>{active&&<Images content={content} can={can} run={run} dirty={dirty} ownerType={kind} ownerKey={active.id}/>}</div>}
    </div>{!rows.length&&!form&&<div className="rounded-xl bg-[var(--muted)] p-7 text-center"><p className={muted}>Chưa có nội dung. Thêm mới khi bạn muốn hiển thị phần này.</p></div>}
  </section>;
}

export default function AboutStoryManager() {
  const {identity,loading:authLoading}=useAuth();
  const can=useCallback((p:string)=>may(identity?.permissions,p),[identity]);
  const canRead=can('content.read');
  const [content,setContent]=useState<AboutContent|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[tab,setTab]=useState<ChapterKey>('opening'),[busy,setBusy]=useState(false);
  const [dirtyParts,setDirtyParts]=useState<Record<string,boolean>>({});
  const pending=Object.values(dirtyParts).some(Boolean);
  const dirty=useCallback((key:string,value:boolean)=>setDirtyParts(old=>({...old,[key]:value})),[]);
  const reload=useCallback(async()=>{const data=await getAboutContent();setContent(data);setError('');},[]);
  useEffect(()=>{if(authLoading||!canRead)return;let live=true;getAboutContent().then(data=>{if(live)setContent(data);}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Không tải được nội dung.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[authLoading,canRead]);
  useEffect(()=>{if(!pending)return;const handler=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[pending]);
  const run:Runner=async(task,message,ownForm=false)=>{
    if(busy)return false;
    if(pending&&!ownForm){toast.error('Hãy áp dụng phần đang chỉnh trước khi thực hiện thao tác khác.');return false;}
    // Applying one editor must not silently discard a different editor's changes.
    if(ownForm&&Object.values(dirtyParts).filter(Boolean).length>1){toast.error('Hãy hoàn tất từng phần chỉnh sửa một lần.');return false;}
    setBusy(true);
    let applied=false;
    try{await task();applied=true;await reload();setDirtyParts({});toast.success(message);return true;}
    catch(e){if(applied){setError('Đã lưu thay đổi nhưng chưa tải lại được nội dung. Hãy tải lại trang trước khi chỉnh tiếp.');toast.error('Đã lưu. Chưa tải lại được nội dung.');}else{toast.error(e instanceof Error?e.message:'Không thể áp dụng. Nội dung đang nhập vẫn được giữ.');if(e instanceof ApiError&&e.status===409)setError('Nội dung vừa được cập nhật ở nơi khác. Sao chép phần đang nhập trước khi tải lại.');}return false;}
    finally{setBusy(false);}
  };
  if(authLoading||loading&&can('content.read'))return <p className="p-6 text-[var(--muted-fg)]">Đang tải nội dung giới thiệu…</p>;
  if(!can('content.read'))return <p className="p-6 text-red-600">Tài khoản chưa có quyền xem nội dung giới thiệu.</p>;
  if(!content)return <div className={`${panel} p-6`} role="alert"><p>{error||'Chưa có nội dung giới thiệu.'}</p><Button className="mt-4" onClick={()=>void reload().catch(e=>setError(e.message))}>Thử lại</Button></div>;
  const section=content.sections.find(s=>s.chapterKey===tab);
  return <main className="space-y-6"><PageHeader title="Giới thiệu Toàn Trung" subtitle="Quản lý nội dung đang hiển thị trên website" actions={<a href={`${(process.env.NEXT_PUBLIC_WEBSITE_URL||'https://xeluottoantrung.com').replace(/\/$/,'')}/ve-chung-toi`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2.5 text-sm font-medium"><ExternalLink size={16}/>Xem trang web</a>}/>
    {error&&<div role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm">{error}<button type="button" className="ml-2 underline" onClick={()=>{if(!pending||window.confirm('Tải lại sẽ bỏ thay đổi chưa áp dụng. Tiếp tục?')){setDirtyParts({});void reload();}}}>Tải lại nội dung</button></div>}
    <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]"><nav aria-label="Các phần giới thiệu" className={`${panel} flex gap-2 overflow-x-auto p-3 lg:sticky lg:top-5 lg:flex-col`}>
      {chapterKeys.map((key,index)=>{const Icon=icons[index];return <button type="button" key={key} aria-current={tab===key?'page':undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3.5 text-left text-sm font-medium transition-colors ${tab===key?'bg-red-500/10 text-red-600':'hover:bg-[var(--muted)]'}`} onClick={()=>{if(key===tab||pending&&!window.confirm('Bỏ thay đổi chưa áp dụng?'))return;setDirtyParts({});setTab(key);}}><Icon size={19}/><span>{chapterNames[index]}</span></button>;})}
      <p className="mt-3 hidden border-t border-[var(--border-color)] px-3 pt-4 text-xs leading-relaxed text-[var(--muted-fg)] lg:block">Áp dụng từng phần để cập nhật ngay. Không cần thực hiện thêm bước xuất bản.</p>
    </nav><div className="min-w-0" key={`${tab}-${content.revision}`}><fieldset disabled={busy} className="min-w-0 border-0 p-0">{section&&<SectionForm section={section} content={content} can={can} run={run} dirty={dirty}/>}<Images content={content} can={can} run={run} dirty={dirty} ownerType="section" ownerKey={tab}/>{(tab==='milestones'||tab==='stories')&&<Records kind={tab==='milestones'?'milestone':'story'} content={content} can={can} run={run} dirty={dirty}/>}</fieldset>{busy&&<p role="status" className="mt-3 text-sm text-red-600">Đang áp dụng thay đổi…</p>}</div></div>
  </main>;
}
