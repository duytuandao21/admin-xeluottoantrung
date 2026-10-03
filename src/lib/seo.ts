export interface SeoRecord {
  id?: string;
  routePath: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

export const seoSections: Record<string, { label: string; route: string }> = {
  'trang-chu': { label: 'Trang chủ', route: '/' },
  'mua-xe': { label: 'Mua xe', route: '/san-pham' },
  'phu-kien-o-to': { label: 'Phụ kiện ô tô', route: '/phu-kien-o-to' },
  'ban-xe': { label: 'Bán xe', route: '/ban-xe' },
  'len-doi': { label: 'Lên đời', route: '/len-doi' },
  'tin-tuc': { label: 'Bài viết', route: '/bai-viet' },
  'cau-hoi-thuong-gap': { label: 'Câu hỏi thường gặp', route: '/cau-hoi' },
  'danh-gia-khach-hang': { label: 'Đánh giá khách hàng', route: '/cam-nhan' },
  'dich-vu': { label: 'Dịch vụ', route: '/dich-vu' },
  'gioi-thieu': { label: 'Giới thiệu', route: '/ve-chung-toi' },
  'tuyen-dung': { label: 'Tuyển dụng', route: '/tuyen-dung' },
};
export const seoRouteAliases: Record<string, string> = {
  '/mua-xe': '/san-pham', '/danh-gia-khach-hang': '/cam-nhan', '/tin-tuc': '/bai-viet', '/cau-hoi-thuong-gap': '/cau-hoi',
};
export function normalizeSeoRoute(route: string) {
  const path = route.trim().replace(/\/+$/, '') || '/';
  return seoRouteAliases[path] || path;
}
export const emptySeo = (routePath = ''): SeoRecord => ({ routePath, metaTitle: null, metaDescription: null, keywords: null,
  ogTitle: null, ogDescription: null, ogImageUrl: null, canonicalUrl: null, robotsIndex: true, robotsFollow: true });
