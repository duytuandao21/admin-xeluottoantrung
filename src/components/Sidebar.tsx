'use client';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard, Car, FolderTree, Mail, PhoneCall, UserPlus,
  Building2, Shapes, Calendar, Settings2, Briefcase, DollarSign, Wrench,
  Info, Heart, HelpCircle, Newspaper, Users, Image,
  Palette, Phone, Share2, Smartphone, CreditCard,
  FileText, ArrowLeftRight, Compass, ListChecks, ShoppingCart, HandCoins,
  ImagePlus, Star, BookOpen, BarChart3, Search, ChevronDown,
  Gauge, ClipboardCheck, ScanText, PanelBottom, BadgeCheck, UserCog, SlidersHorizontal, Factory, CarFront,
  type LucideIcon
} from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { label: 'Thống kê', href: '/thong-ke', icon: BarChart3 },
  {
    label: 'Sản phẩm', icon: Car, children: [
      { label: 'Danh sách xe', href: '/san-pham', icon: Car },
      { label: 'Hãng xe', href: '/san-pham/hang-xe', icon: Factory },
      { label: 'Dòng xe', href: '/san-pham/dong-xe', icon: CarFront },
      { label: 'Phiên bản xe', href: '/san-pham/phien-ban', icon: BadgeCheck },
    ]
  },
  {
    label: 'Bộ lọc xe', icon: SlidersHorizontal, children: [
      { label: 'Kiểu dáng', href: '/quan-ly/kieu-dang', icon: Shapes },
      { label: 'Ngân sách', href: '/quan-ly/ngan-sach', icon: DollarSign },
      { label: 'Năm sản xuất', href: '/quan-ly/nam-san-xuat', icon: Calendar },
      { label: 'Gợi ý năm SX', href: '/thiet-lap/goi-y-nam-san-xuat', icon: Calendar },
      { label: 'Hộp số', href: '/quan-ly/hop-so', icon: Settings2 },
      { label: 'Số km', href: '/thiet-lap/so-km', icon: Gauge },
      { label: 'Màu sắc', href: '/thiet-lap/mau-sac', icon: Palette },
      { label: 'Biển số', href: '/thiet-lap/bien-so', icon: ScanText },
      { label: 'Tình trạng xe', href: '/thiet-lap/tinh-trang', icon: ClipboardCheck },
    ]
  },
  { label: 'Dịch vụ', href: '/quan-ly/dich-vu', icon: Wrench },
  { label: 'Tin tức', href: '/quan-ly/tin-tuc', icon: Newspaper },
  {
    label: 'Chi nhánh', icon: Building2, children: [
      { label: 'Danh mục chi nhánh', href: '/quan-ly/danh-muc-chi-nhanh', icon: FolderTree },
      { label: 'Danh sách chi nhánh', href: '/quan-ly/chi-nhanh', icon: Building2 },
    ]
  },
  {
    label: 'Bài viết & nội dung', icon: FileText, children: [
      { label: 'Giới thiệu', href: '/quan-ly/gioi-thieu', icon: Info },
      { label: 'Cảm nhận KH', href: '/quan-ly/cam-nhan-khach-hang', icon: Heart },
      { label: 'Câu hỏi thường gặp', href: '/quan-ly/cau-hoi-thuong-gap', icon: HelpCircle },
      { label: 'Tuyển dụng', href: '/quan-ly/tuyen-dung', icon: Briefcase },
      { label: 'Nội dung thống kê', href: '/quan-ly/thong-ke-noi-dung', icon: BarChart3 },
      { label: 'Tại sao chọn', href: '/thiet-lap/tai-sao-chon', icon: Star },
    ]
  },
  {
    label: 'Quy trình & hướng dẫn', icon: ListChecks, children: [
      { label: 'Quy trình bán xe', href: '/thiet-lap/quy-trinh-ban-xe', icon: ListChecks },
      { label: 'Khám phá xe', href: '/thiet-lap/kham-pha-xe', icon: Compass },
      { label: 'Các bước mua xe', href: '/thiet-lap/cac-buoc-mua-xe', icon: ShoppingCart },
      { label: 'Các bước bán xe', href: '/thiet-lap/cac-buoc-ban-xe', icon: HandCoins },
      { label: 'Các bước lên đời', href: '/thiet-lap/cac-buoc-len-doi', icon: ArrowLeftRight },
      { label: 'Chính sách & ĐK', href: '/thiet-lap/chinh-sach-dieu-kien', icon: BookOpen },
    ]
  },
  {
    label: 'Hộp thư', icon: Mail, children: [
      { label: 'Thư bán xe', href: '/thu/ban-xe', icon: Mail },
      { label: 'Thư lên đời xe', href: '/thu/len-doi-xe', icon: ArrowLeftRight },
      { label: 'Yêu cầu gọi lại', href: '/thu/yeu-cau-goi-lai', icon: PhoneCall },
      { label: 'Đăng ký nhận tin', href: '/thu/dang-ky-nhan-tin', icon: UserPlus },
    ]
  },
  {
    label: 'Trang tĩnh', icon: FileText, children: [
      { label: 'Liên hệ', href: '/thiet-lap/lien-he', icon: PhoneCall },
      { label: 'Footer', href: '/thiet-lap/footer', icon: PanelBottom },
      { label: 'Text trả góp', href: '/thiet-lap/text-tra-gop', icon: CreditCard },
      { label: 'Text bán xe', href: '/thiet-lap/text-ban-xe', icon: FileText },
      { label: 'Text lên đời', href: '/thiet-lap/text-len-doi', icon: FileText },
    ]
  },
  {
    label: 'Hình ảnh & kênh', icon: Image, children: [
      { label: 'Logo', href: '/thiet-lap/logo', icon: BadgeCheck },
      { label: 'Favicon', href: '/thiet-lap/favicon', icon: ImagePlus },
      { label: 'Slideshow', href: '/thiet-lap/slideshow', icon: Image },
      { label: 'Banner dòng xe', href: '/thiet-lap/banner-dong-xe', icon: Image },
      { label: 'Banner lên đời', href: '/thiet-lap/banner-len-doi', icon: Image },
      { label: 'Ảnh vì sao chọn', href: '/thiet-lap/anh-vi-sao-chon', icon: ImagePlus },
      { label: 'Ảnh chi nhánh', href: '/thiet-lap/anh-chi-nhanh', icon: ImagePlus },
      { label: 'Mạng xã hội', href: '/thiet-lap/mang-xa-hoi', icon: Share2 },
      { label: 'Ứng dụng', href: '/thiet-lap/ung-dung', icon: Smartphone },
    ]
  },
  {
    label: 'Cài đặt website', icon: Settings2, children: [
      { label: 'Thông tin chung', href: '/thiet-lap/thong-tin', icon: Info },
      { label: 'Nút gọi', href: '/thiet-lap/nut-goi', icon: Phone },
    ]
  },
  {
    label: 'SEO', icon: Search, children: [
      { label: 'FAQ', href: '/seo/cau-hoi-thuong-gap', icon: HelpCircle },
      { label: 'Đánh giá KH', href: '/seo/danh-gia-khach-hang', icon: Heart },
      { label: 'Mua xe', href: '/seo/mua-xe', icon: ShoppingCart },
      { label: 'Tin tức', href: '/seo/tin-tuc', icon: Newspaper },
    ]
  },
  {
    label: 'Tài khoản', icon: Users, children: [
      { label: 'Khách hàng', href: '/tai-khoan/khach-hang', icon: Users },
      { label: 'Thông tin Admin', href: '/tai-khoan/admin', icon: UserCog },
    ]
  },
];

function SidebarMenuItem({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const pathname = usePathname();
  const { sidebarOpen } = useTheme();
  const isActive = item.href === pathname;
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some(child =>
    child.href === pathname || (child.children && child.children.some(c => c.href === pathname))
  );

  const [open, setOpen] = useState(isChildActive);

  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-all duration-200 group
            ${isChildActive
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <Icon className="w-[18px] h-[18px] shrink-0" />
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 999 ? '999+' : item.badge}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />
            </>
          )}
        </button>
        {open && sidebarOpen && (
          <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
            {item.children!.map((child, i) => (
              <SidebarMenuItem key={i} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '/'}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-all duration-200 group
        ${isActive
          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'group-hover:text-red-400'}`} />
      {sidebarOpen && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
              ${isActive ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
              {item.badge > 999 ? '999+' : item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { sidebarOpen } = useTheme();
  const { identity } = useAuth();
  const profile = { name: identity?.profile.fullName || 'Quản trị viên', email: identity?.profile.email || '' };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen gradient-sidebar z-40 transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-[68px]'}`}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/10">
        <Link href="/" aria-label="Về trang tổng quan" className="flex h-full w-full items-center justify-center overflow-hidden">
            <NextImage src="/images/logo-gold.png" alt="Toàn Trung" width={1600} height={640} sizes={sidebarOpen ? '160px' : '84px'} className={`h-auto max-w-none shrink-0 ${sidebarOpen ? 'w-40' : 'w-[84px]'}`} />
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item, i) => (
          <SidebarMenuItem key={i} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {profile.name.charAt(0).toUpperCase() || 'A'}
          </div>
          {sidebarOpen && (
            <div className="animate-fadeIn min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile.name}</p>
              <p className="text-gray-500 text-xs truncate">{profile.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
