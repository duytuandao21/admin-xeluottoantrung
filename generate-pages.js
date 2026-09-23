// Script to generate all settings pages
const fs = require('fs');
const path = require('path');

const pages = [
  { dir: 'thiet-lap/logo', title: 'Quản lý Logo', subtitle: 'Thay đổi logo website', fields: `[{name:'logo',label:'Logo chính',type:'file',hint:'Kích thước đề xuất: 200x60px'},{name:'logoDark',label:'Logo nền tối',type:'file',hint:'Logo hiển thị trên nền tối'},{name:'logoMobile',label:'Logo mobile',type:'file',hint:'Logo cho thiết bị di động'}]` },
  { dir: 'thiet-lap/favicon', title: 'Quản lý Favicon', subtitle: 'Thay đổi favicon website', fields: `[{name:'favicon',label:'Favicon',type:'file',hint:'Kích thước: 32x32px, định dạng .ico hoặc .png'}]` },
  { dir: 'thiet-lap/mau-sac', title: 'Quản lý màu sắc', subtitle: 'Cấu hình bảng màu website', fields: `[{name:'primaryColor',label:'Màu chính',type:'color',defaultValue:'#dc2626'},{name:'secondaryColor',label:'Màu phụ',type:'color',defaultValue:'#f59e0b'},{name:'headerBg',label:'Màu header',type:'color',defaultValue:'#ffffff'},{name:'footerBg',label:'Màu footer',type:'color',defaultValue:'#1a1c2e'},{name:'buttonColor',label:'Màu nút',type:'color',defaultValue:'#dc2626'},{name:'linkColor',label:'Màu liên kết',type:'color',defaultValue:'#2563eb'}]` },
  { dir: 'thiet-lap/nut-goi', title: 'Quản lý nút gọi', subtitle: 'Cấu hình nút gọi điện & Zalo', fields: `[{name:'phone',label:'Số điện thoại',defaultValue:'0901234567'},{name:'zaloNumber',label:'Số Zalo',defaultValue:'0901234567'},{name:'showCallButton',label:'Hiển thị nút gọi',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'showZaloButton',label:'Hiển thị Zalo',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]},{name:'buttonPosition',label:'Vị trí nút',type:'select',options:[{value:'bottom-right',label:'Dưới phải'},{value:'bottom-left',label:'Dưới trái'}]},{name:'buttonColor',label:'Màu nút gọi',type:'color',defaultValue:'#dc2626'}]` },
  { dir: 'thiet-lap/mang-xa-hoi', title: 'Mạng xã hội', subtitle: 'Cấu hình liên kết mạng xã hội', fields: `[{name:'facebook',label:'Facebook',type:'url',defaultValue:'https://facebook.com/xeluottoantrung'},{name:'youtube',label:'Youtube',type:'url',placeholder:'https://youtube.com/...'},{name:'zalo',label:'Zalo OA',placeholder:'Zalo OA ID'},{name:'tiktok',label:'TikTok',type:'url',placeholder:'https://tiktok.com/@...'},{name:'instagram',label:'Instagram',type:'url',placeholder:'https://instagram.com/...'},{name:'twitter',label:'Twitter/X',type:'url',placeholder:'https://x.com/...'}]` },
  { dir: 'thiet-lap/ung-dung', title: 'Ứng dụng di động', subtitle: 'Liên kết tải ứng dụng', fields: `[{name:'iosUrl',label:'App Store URL',type:'url',placeholder:'https://apps.apple.com/...'},{name:'androidUrl',label:'Google Play URL',type:'url',placeholder:'https://play.google.com/...'},{name:'appName',label:'Tên ứng dụng',defaultValue:'Xe Lướt Toàn Trung'},{name:'appDescription',label:'Mô tả ứng dụng',type:'textarea'}]` },
  { dir: 'thiet-lap/text-tra-gop', title: 'Text trả góp', subtitle: 'Nội dung trang trả góp', fields: `[{name:'title',label:'Tiêu đề',defaultValue:'Hỗ trợ trả góp lãi suất ưu đãi'},{name:'subtitle',label:'Phụ đề',defaultValue:'Trả góp lên đến 80% giá trị xe'},{name:'content',label:'Nội dung chi tiết',type:'textarea',defaultValue:'Chúng tôi hỗ trợ khách hàng vay mua xe trả góp với lãi suất ưu đãi qua các ngân hàng liên kết...'},{name:'bankList',label:'Danh sách ngân hàng',type:'textarea',defaultValue:'Vietcombank, BIDV, Techcombank, VPBank, MB Bank'}]` },
  { dir: 'thiet-lap/text-ban-xe', title: 'Text bán xe', subtitle: 'Nội dung trang bán xe', fields: `[{name:'title',label:'Tiêu đề',defaultValue:'Bán xe cho Toàn Trung'},{name:'subtitle',label:'Phụ đề',defaultValue:'Bán xe nhanh chóng, giá tốt nhất thị trường'},{name:'content',label:'Nội dung chi tiết',type:'textarea'},{name:'advantages',label:'Ưu điểm',type:'textarea',defaultValue:'Định giá miễn phí, thanh toán trong ngày, thủ tục nhanh gọn'}]` },
  { dir: 'thiet-lap/text-len-doi', title: 'Text lên đời', subtitle: 'Nội dung trang lên đời xe', fields: `[{name:'title',label:'Tiêu đề',defaultValue:'Lên đời xe tại Toàn Trung'},{name:'subtitle',label:'Phụ đề',defaultValue:'Đổi xe cũ - Lấy xe mới dễ dàng'},{name:'content',label:'Nội dung chi tiết',type:'textarea'},{name:'process',label:'Quy trình đổi xe',type:'textarea'}]` },
  { dir: 'thiet-lap/kham-pha-xe', title: 'Khám phá xe', subtitle: 'Cấu hình trang khám phá xe', fields: `[{name:'title',label:'Tiêu đề',defaultValue:'Khám phá xe tại Toàn Trung'},{name:'description',label:'Mô tả',type:'textarea'},{name:'bannerImage',label:'Ảnh banner',type:'file'}]` },
  { dir: 'thiet-lap/quy-trinh-ban-xe', title: 'Quy trình bán xe', subtitle: 'Chỉnh sửa quy trình bán xe', fields: `[{name:'step1',label:'Bước 1',defaultValue:'Liên hệ & đặt lịch'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Kiểm tra & định giá xe'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận giá'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Hoàn tất thủ tục & thanh toán'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]` },
  { dir: 'thiet-lap/cac-buoc-mua-xe', title: 'Các bước mua xe', subtitle: 'Chỉnh sửa hướng dẫn mua xe', fields: `[{name:'step1',label:'Bước 1',defaultValue:'Chọn xe phù hợp'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Kiểm tra xe & lái thử'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận giá & ký hợp đồng'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Nhận xe & bảo hành'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]` },
  { dir: 'thiet-lap/cac-buoc-ban-xe', title: 'Các bước bán xe', subtitle: 'Chỉnh sửa hướng dẫn bán xe', fields: `[{name:'step1',label:'Bước 1',defaultValue:'Đăng ký bán xe online'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Định giá xe miễn phí'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Thỏa thuận & ký hợp đồng'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Thanh toán ngay'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]` },
  { dir: 'thiet-lap/cac-buoc-len-doi', title: 'Các bước lên đời', subtitle: 'Chỉnh sửa quy trình lên đời xe', fields: `[{name:'step1',label:'Bước 1',defaultValue:'Chọn xe muốn đổi'},{name:'step1Desc',label:'Mô tả bước 1',type:'textarea'},{name:'step2',label:'Bước 2',defaultValue:'Định giá xe cũ'},{name:'step2Desc',label:'Mô tả bước 2',type:'textarea'},{name:'step3',label:'Bước 3',defaultValue:'Bù trừ chênh lệch'},{name:'step3Desc',label:'Mô tả bước 3',type:'textarea'},{name:'step4',label:'Bước 4',defaultValue:'Nhận xe mới'},{name:'step4Desc',label:'Mô tả bước 4',type:'textarea'}]` },
  { dir: 'thiet-lap/banner-dong-xe', title: 'Banner dòng xe', subtitle: 'Quản lý banner cho trang dòng xe', fields: `[{name:'bannerImage',label:'Ảnh banner',type:'file',hint:'Kích thước đề xuất: 1920x400px'},{name:'title',label:'Tiêu đề',defaultValue:'Dòng xe phổ biến'},{name:'subtitle',label:'Phụ đề',type:'textarea'}]` },
  { dir: 'thiet-lap/banner-len-doi', title: 'Banner lên đời', subtitle: 'Quản lý banner trang lên đời xe', fields: `[{name:'bannerImage',label:'Ảnh banner',type:'file',hint:'Kích thước đề xuất: 1920x400px'},{name:'title',label:'Tiêu đề',defaultValue:'Lên đời xe dễ dàng'},{name:'subtitle',label:'Phụ đề',type:'textarea'}]` },
  { dir: 'thiet-lap/chinh-sach-dieu-kien', title: 'Chính sách & Điều kiện', subtitle: 'Chỉnh sửa chính sách và điều kiện', fields: `[{name:'warrantyPolicy',label:'Chính sách bảo hành',type:'textarea',defaultValue:'Bảo hành 6-12 tháng cho tất cả xe...'},{name:'returnPolicy',label:'Chính sách đổi trả',type:'textarea',defaultValue:'Đổi trả trong 7 ngày nếu phát hiện lỗi...'},{name:'paymentPolicy',label:'Chính sách thanh toán',type:'textarea'},{name:'terms',label:'Điều khoản sử dụng',type:'textarea'},{name:'privacy',label:'Chính sách bảo mật',type:'textarea'}]` },
  { dir: 'thiet-lap/tai-sao-chon', title: 'Tại sao chọn chúng tôi', subtitle: 'Chỉnh sửa lý do chọn Toàn Trung', fields: `[{name:'reason1',label:'Lý do 1',defaultValue:'Uy tín hàng đầu'},{name:'reason1Desc',label:'Mô tả lý do 1',type:'textarea'},{name:'reason2',label:'Lý do 2',defaultValue:'Giá cả hợp lý'},{name:'reason2Desc',label:'Mô tả lý do 2',type:'textarea'},{name:'reason3',label:'Lý do 3',defaultValue:'Bảo hành dài hạn'},{name:'reason3Desc',label:'Mô tả lý do 3',type:'textarea'},{name:'reason4',label:'Lý do 4',defaultValue:'Hỗ trợ trả góp'},{name:'reason4Desc',label:'Mô tả lý do 4',type:'textarea'}]` },
  { dir: 'thiet-lap/anh-vi-sao-chon', title: 'Ảnh vì sao chọn', subtitle: 'Quản lý hình ảnh minh họa', fields: `[{name:'image1',label:'Ảnh 1',type:'file'},{name:'image2',label:'Ảnh 2',type:'file'},{name:'image3',label:'Ảnh 3',type:'file'},{name:'image4',label:'Ảnh 4',type:'file'}]` },
  { dir: 'thiet-lap/anh-chi-nhanh', title: 'Ảnh chi nhánh', subtitle: 'Quản lý hình ảnh chi nhánh', fields: `[{name:'image1',label:'Ảnh chi nhánh 1',type:'file'},{name:'caption1',label:'Chú thích 1'},{name:'image2',label:'Ảnh chi nhánh 2',type:'file'},{name:'caption2',label:'Chú thích 2'},{name:'image3',label:'Ảnh chi nhánh 3',type:'file'},{name:'caption3',label:'Chú thích 3'}]` },
  { dir: 'thiet-lap/goi-y-nam-san-xuat', title: 'Gợi ý năm sản xuất', subtitle: 'Cấu hình gợi ý năm sản xuất trên trang chủ', fields: `[{name:'startYear',label:'Năm bắt đầu',type:'number',defaultValue:'2015'},{name:'endYear',label:'Năm kết thúc',type:'number',defaultValue:'2024'},{name:'display',label:'Hiển thị',type:'select',options:[{value:'1',label:'Có'},{value:'0',label:'Không'}]}]` },
];

const base = path.join(__dirname, 'src', 'app');

pages.forEach(({ dir, title, subtitle, fields }) => {
  const fullDir = path.join(base, dir);
  fs.mkdirSync(fullDir, { recursive: true });
  const content = `'use client';
import SettingsPage from '@/components/SettingsPage';
export default function Page() {
  return <SettingsPage title="${title}" subtitle="${subtitle}" fields={${fields}} />;
}
`;
  fs.writeFileSync(path.join(fullDir, 'page.tsx'), content, 'utf-8');
  console.log(`Created: ${dir}/page.tsx`);
});

// Also create simple attribute pages for bien-so, tinh-trang, so-km
const attrPages = [
  { dir: 'thiet-lap/bien-so', title: 'Quản lý biển số', data: 'mockColors', nameLabel: 'Loại biển số' },
  { dir: 'thiet-lap/tinh-trang', title: 'Quản lý tình trạng xe', data: 'mockBodyStyles', nameLabel: 'Tình trạng' },
  { dir: 'thiet-lap/so-km', title: 'Quản lý số KM', data: 'mockBudgets', nameLabel: 'Khoảng số KM' },
];

attrPages.forEach(({ dir, title, data, nameLabel }) => {
  const fullDir = path.join(base, dir);
  fs.mkdirSync(fullDir, { recursive: true });
  const content = `'use client';
import CrudPage from '@/components/CrudPage';
import { ${data} } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui';
export default function Page() {
  return <CrudPage title="${title}" data={${data} as unknown as Record<string, unknown>[]} columns={[
    { key: 'id', label: 'STT', width: '60px' },
    { key: 'name', label: '${nameLabel}', sortable: true, render: (item) => <span className="font-medium">{String(item.name)}</span> },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Thứ tự', sortable: true },
    { key: 'status', label: 'Trạng thái', render: (item) => <StatusBadge status={String(item.status)} /> },
  ]} formFields={[
    { name: 'name', label: '${nameLabel}', required: true },
    { name: 'slug', label: 'Slug' },
    { name: 'order', label: 'Thứ tự', type: 'number' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ẩn' }] },
  ]} searchPlaceholder="Tìm kiếm..." searchFields={['name']} />;
}
`;
  fs.writeFileSync(path.join(fullDir, 'page.tsx'), content, 'utf-8');
  console.log(`Created: ${dir}/page.tsx`);
});

console.log('\\nAll settings pages created successfully!');
