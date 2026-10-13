# Giao diện quản lý chi phí sử dụng xe

## Bố cục hiện hành

- **Tổng quan:** bộ lọc ngày, bốn khung thống kê dùng `StatsCard`, xe được quan tâm và phân bố quãng đường. Bấm một xe để mở lịch sử đã lọc theo xe đó.
- **Lịch sử khảo sát:** bộ lọc ngày, tìm tên/chọn xe, thanh toán, sắp xếp; bảng dùng `DataTable` và phân trang server. Chi tiết mở thành màn hình riêng trong cùng trang, có nút quay lại.
- **Cấu hình chi phí:** năm nhóm gồm khảo sát mặc định, nhiên liệu/tiêu hao, bảo dưỡng/khấu hao, phí/bảo hiểm và thiết lập nâng cao. Dữ liệu đã nhập giữ nguyên khi chuyển nhóm.
- **Định mức theo xe:** hiển thị thứ tự ưu tiên, tìm tên định mức, bảng danh sách và biểu mẫu sửa riêng. Biểu mẫu tách thông tin áp dụng, tiêu hao và bảo dưỡng.

## Chỉnh sửa

- Dùng lại `Button`, `Input`, `Select`, `StatsCard`, `StatusBadge` và `DataTable` của Admin; CSS chỉ áp dụng cho ownership.
- Mốc chọn nhanh được chỉnh bằng từng ô số, thêm/bỏ riêng, kiểm tra trùng; không phải nhập danh sách bằng dấu phẩy.
- Phí có tóm tắt tên/loại/số tiền, mở để chỉnh điều kiện. Mã phí/hạng mục/danh mục không cần chỉnh tay; mã mới được sinh riêng và mã cũ giữ nguyên.
- Các hệ số tuổi xe/ODO nằm trong phần nâng cao. Tỷ lệ hao hụt và hệ số được trình bày bằng phần trăm, chuyển đổi về tỷ lệ trước khi gửi API.
- Có trạng thái chưa lưu, xác nhận lưu/khôi phục/xóa và cảnh báo khi rời bản nháp. Khôi phục chỉ thay biểu mẫu, cần lưu mới áp dụng.
- Trường không hợp lệ trong nhóm đang ẩn sẽ mở đúng nhóm và nhận focus. Tài khoản chỉ xem vẫn chuyển được giữa các nhóm; các ô sửa và nút lưu bị khóa.

## Phạm vi và kiểm tra

Chỉ thay Admin và script kiểm tra giao diện Admin. Giữ nguyên API, công thức tính, database, quyền, khảo sát đã lưu và giao diện Web. Không cần migration mới hay biến môi trường mới.

- Production build và TypeScript đạt.
- Lint đạt, còn 12 cảnh báo cũ ngoài phần ownership.
- Browser integration đạt ở 1440, 768 và 390 px: tổng quan/lịch sử, phân trang/lọc/chi tiết, giữ bản nháp, hủy chuyển mục, validation nhóm ẩn, chuyển đổi tỷ lệ, thêm/sửa/bỏ phí, lưu/xóa định mức, lịch bảo dưỡng và quyền chỉ xem.
- Kiểm thử API chỉ ghi vào fixture PGlite, không sửa cấu hình database thật.
- Log và ảnh: `api-xeluottoantrung/.test-dist/ownership-admin-ui/redesign-*.log` và các ảnh `{width}-overview/settings/maintenance/profiles/surveys/detail.png`. Đây là artifacts local, không cần deploy.
