# Xe Lướt Toàn Trung Admin

Giao diện quản trị Next.js 16 kết nối API NestJS, Supabase Auth và Cloudflare R2. Layout và form giữ theo bản admin cũ.

## Chạy tại máy

1. Sao chép `.env.example` thành `.env` và điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable/anon key). Đặt `NEXT_PUBLIC_API_URL=http://localhost:4000` nếu API chạy cổng mặc định. Không đặt Supabase service role key trong admin.
2. Chạy API và kiểm tra `http://localhost:4000/health` trả 200. API cần kết nối PostgreSQL và R2 theo README của `api-xeluottoantrung`.
3. Chạy `npm install`, `npm run dev`, mở `http://localhost:3000/dang-nhap`. Tài khoản Supabase phải có profile admin đang hoạt động và role phù hợp trong PostgreSQL.

Admin lấy danh sách và lưu thay đổi qua `/api/v1/admin/*` bằng access token Supabase. Trình duyệt tự duy trì phiên; đăng xuất trong menu tài khoản. Ảnh được ký URL qua API, tải trực tiếp lên R2 và lưu URL công khai; ảnh xe còn được đăng ký vào bảng media của xe. R2 bucket cần CORS cho origin admin, method PUT và header Content-Type.

Các dữ liệu nghiệp vụ cũ từng lưu trong `localStorage` không tự chuyển vào PostgreSQL. Nếu cần giữ dữ liệu đó, hãy nhập lại qua admin hoặc lập bước migration riêng. Màn thống kê truy cập hiển thị trạng thái chưa có dữ liệu cho tới khi cấu hình một nguồn analytics thật.

## Kiểm tra

```bash
npm run lint
npx tsc --noEmit
npm run build
```
