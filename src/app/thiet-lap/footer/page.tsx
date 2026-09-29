'use client';

import SettingsPage, { type SettingsField } from '@/components/SettingsPage';

const services = [
  ['Mua xe', '/san-pham'], ['Bán xe', '/ban-xe'], ['Lên đời xe', '/len-doi'],
  ['Bảo hiểm', 'https://baohiemtasco.com/san-pham/bao-hiem-o-to-xe-may/'], ['Cứu hộ RSA', ''],
];
const about = [
  ['Về chúng tôi', '/ve-chung-toi'], ['Hệ thống showroom', '#tt-showrooms'],
  ['Liên hệ', '#tt-footer-contact'], ['Chính sách quyền riêng tư', '/chinh-sach-quyen-rieng-tu'],
];

const fields: SettingsField[] = [
  { section: 'Giới thiệu và liên kết xã hội', name: 'footerAbout', label: 'Mô tả Toàn Trung', type: 'textarea', defaultValue: 'Hệ thống mua bán ô tô đã qua sử dụng, hướng tới trải nghiệm minh bạch, thuận tiện và chuyên nghiệp cho khách hàng.' },
  { name: 'facebookUrl', label: 'Facebook', defaultValue: 'https://www.facebook.com/ototoantrung' },
  { name: 'tiktokUrl', label: 'TikTok', defaultValue: 'https://www.tiktok.com/@toantrunggialai' },
  { name: 'youtubeUrl', label: 'YouTube', defaultValue: 'https://www.youtube.com/@ototoantrung' },
  { section: 'Danh mục Dịch vụ', name: 'serviceTitle', label: 'Tiêu đề danh mục', defaultValue: 'Dịch vụ' },
  ...services.flatMap(([label, href], index): SettingsField[] => [
    { name: `serviceLink${index + 1}Label`, label: `Mục ${index + 1} — tên`, defaultValue: label },
    { name: `serviceLink${index + 1}Href`, label: `Mục ${index + 1} — liên kết`, defaultValue: href, placeholder: '/duong-dan hoặc https://...' },
  ]),
  { section: 'Danh mục Về Toàn Trung', name: 'aboutTitle', label: 'Tiêu đề danh mục', defaultValue: 'Về Toàn Trung' },
  ...about.flatMap(([label, href], index): SettingsField[] => [
    { name: `aboutLink${index + 1}Label`, label: `Mục ${index + 1} — tên`, defaultValue: label },
    { name: `aboutLink${index + 1}Href`, label: `Mục ${index + 1} — liên kết`, defaultValue: href, placeholder: '/duong-dan, #vi-tri hoặc https://...' },
  ]),
  { section: 'Liên hệ nhanh', name: 'contactTitle', label: 'Tiêu đề', defaultValue: 'Liên hệ nhanh' },
  { name: 'quickPhoneLabel', label: 'Nhãn điện thoại', defaultValue: 'Tổng đài hỗ trợ' },
  { name: 'footerPhone', label: 'Số điện thoại', defaultValue: '0777 393 913' },
  { name: 'quickAddressLabel', label: 'Nhãn địa chỉ', defaultValue: 'Trụ sở' },
  { name: 'footerAddress', label: 'Địa chỉ', defaultValue: '338–340–342–344 Hùng Vương, Phường Pleiku, Tỉnh Gia Lai' },
  { name: 'quickWebsiteLabel', label: 'Nhãn website', defaultValue: 'Website' },
  { name: 'quickWebsiteText', label: 'Tên website hiển thị', defaultValue: 'xeluottoantrung.com' },
  { name: 'quickWebsiteUrl', label: 'Liên kết website', defaultValue: '/' },
  { section: 'Chứng nhận và bản tin', name: 'certificateTitle', label: 'Tiêu đề chứng nhận', defaultValue: 'Chứng nhận' },
  { name: 'certificateUrl', label: 'Liên kết khi bấm logo chứng nhận', placeholder: 'https://online.gov.vn/...', hint: 'Nhập đường dẫn xác thực chứng nhận. Khi chưa có đường dẫn, logo chỉ hiển thị và không mở trang khác.' },
  { name: 'newsletterTitle', label: 'Tiêu đề nhận tin', defaultValue: 'Đăng ký nhận tin từ Toàn Trung' },
  { name: 'newsletterDescription', label: 'Mô tả nhận tin', type: 'textarea', defaultValue: 'Nhận thông tin xe mới về, chương trình ưu đãi và những cập nhật mới nhất.' },
  { name: 'newsletterPlaceholder', label: 'Gợi ý ô email', defaultValue: 'Nhập email của bạn' },
  { name: 'newsletterButton', label: 'Chữ nút đăng ký', defaultValue: 'Đăng ký' },
  { section: 'Showroom', name: 'showroomTitle', label: 'Tiêu đề', defaultValue: 'Hệ thống showroom', hint: 'Tên, địa chỉ và Google Maps của từng showroom chỉnh tại Quản lý chi nhánh.' },
  { section: 'Thông tin doanh nghiệp', name: 'businessName', label: 'Tên doanh nghiệp', defaultValue: 'CÔNG TY TNHH MỘT THÀNH VIÊN TOÀN TRUNG' },
  { name: 'businessDescription', label: 'Dòng mô tả pháp lý', defaultValue: 'Thông tin pháp lý doanh nghiệp' },
  { name: 'businessTaxLabel', label: 'Nhãn mã số doanh nghiệp', defaultValue: 'GCNĐKDN / MST' },
  { name: 'businessTaxId', label: 'Mã số doanh nghiệp / MST', defaultValue: '5900674378' },
  { name: 'businessIssueDate', label: 'Ngày cấp hiển thị', defaultValue: 'Ngày cấp: 06/01/2010' },
  { name: 'businessPhoneLabel', label: 'Nhãn điện thoại', defaultValue: 'Điện thoại' },
  { name: 'businessPhone', label: 'Điện thoại doanh nghiệp', defaultValue: '0777 393 912' },
  { name: 'businessAddressLabel', label: 'Nhãn địa chỉ', defaultValue: 'Địa chỉ trụ sở' },
  { name: 'businessAddress', label: 'Địa chỉ trụ sở', defaultValue: '338–340–342–344 Hùng Vương, Phường Pleiku, Tỉnh Gia Lai' },
  { section: 'Dòng cuối Footer', name: 'footerCopyright', label: 'Bản quyền', defaultValue: '© Auto Toàn Trung. All rights reserved.' },
  { name: 'legalTermsLabel', label: 'Tên liên kết điều khoản', defaultValue: 'Điều khoản sử dụng' },
  { name: 'legalTermsHref', label: 'Liên kết điều khoản', defaultValue: '/dieu-khoan-su-dung' },
  { name: 'legalPrivacyLabel', label: 'Tên liên kết riêng tư', defaultValue: 'Chính sách quyền riêng tư' },
  { name: 'legalPrivacyHref', label: 'Liên kết riêng tư', defaultValue: '/chinh-sach-quyen-rieng-tu' },
];

export default function Page() {
  return <SettingsPage title="Quản lý Footer" subtitle="Chỉnh sửa nội dung Footer; bố cục được giữ nguyên. Liên kết Google Maps của showroom quản lý trong mục Chi nhánh." fields={fields} />;
}
