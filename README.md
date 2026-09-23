# Xe Lướt Toàn Trung Admin

Giao diện quản trị Next.js 16, đối chiếu theo các bản HTML trong `admin-page/`.

## Chạy project

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra bằng `npm run lint` và `npm run build`.

## Dữ liệu hiện tại

Các trang CRUD, thiết lập, thư và thông tin admin dùng dữ liệu mẫu lần đầu và lưu thay đổi trong `localStorage` của trình duyệt (`xeluottoantrung-admin:v1:*`). Dữ liệu được giữ khi tải lại trang và đồng bộ giữa các tab trên cùng trình duyệt. Ảnh tải lên được lưu dạng data URL; mỗi ảnh giới hạn 1 MB. Nút xuất sản phẩm tạo CSV.

Đây là lớp lưu trữ phục vụ dựng lại UI và kiểm thử luồng. Project chưa có cơ sở dữ liệu, API, xác thực người dùng, dịch vụ gửi email hay nguồn analytics. Vì vậy dữ liệu không đồng bộ giữa các máy; đổi mật khẩu, đăng xuất, gửi email hàng loạt và số liệu truy cập thực cần tích hợp backend trước khi dùng như admin production. Các biểu đồ lượt truy cập hiện là dữ liệu minh họa.

Các trang danh sách trong HTML cũ được biểu diễn bằng CRUD ở `src/components/CrudPage.tsx` và `src/components/LegacyCollectionPage.tsx`; các trang nội dung đơn dùng `src/components/SettingsPage.tsx`. Khi có API, thay lớp `src/lib/local-store.ts` bằng các request có xác thực và kiểm tra quyền phía máy chủ.
