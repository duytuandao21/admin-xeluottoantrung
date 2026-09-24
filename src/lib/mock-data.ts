import { Product, Category, Mail, Branch, Service, Testimonial, FAQ, NewsArticle, Recruitment, Customer, Slideshow, DashboardStats, CarAttribute } from './types';

// --- Products ---
export const mockProducts: Product[] = [
  { id: 1, name: 'Toyota Camry 2.5Q', slug: 'toyota-camry-25q', brand: 'Toyota', model: 'Camry', year: 2022, price: 890000000, originalPrice: 950000000, mileage: 25000, transmission: 'Tự động', fuel: 'Xăng', color: 'Trắng', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30A', createdAt: '2024-01-15', updatedAt: '2024-03-10', featured: true, description: 'Toyota Camry 2.5Q 2022, xe đẹp, biển Hà Nội' },
  { id: 2, name: 'Honda CR-V 1.5L Turbo', slug: 'honda-crv-15l', brand: 'Honda', model: 'CR-V', year: 2023, price: 1050000000, mileage: 12000, transmission: 'Tự động', fuel: 'Xăng', color: 'Đen', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '29A', createdAt: '2024-02-20', updatedAt: '2024-03-15', featured: true },
  { id: 3, name: 'Mazda CX-5 2.0 Premium', slug: 'mazda-cx5-20', brand: 'Mazda', model: 'CX-5', year: 2021, price: 750000000, mileage: 35000, transmission: 'Tự động', fuel: 'Xăng', color: 'Đỏ', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30G', createdAt: '2024-01-10', updatedAt: '2024-02-28', featured: false },
  { id: 4, name: 'Hyundai Tucson 2.0 AT', slug: 'hyundai-tucson-20', brand: 'Hyundai', model: 'Tucson', year: 2022, price: 820000000, mileage: 28000, transmission: 'Tự động', fuel: 'Xăng', color: 'Xanh', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '29B', createdAt: '2024-03-01', updatedAt: '2024-03-20', featured: false },
  { id: 5, name: 'Kia Seltos 1.4 Turbo', slug: 'kia-seltos-14', brand: 'Kia', model: 'Seltos', year: 2023, price: 680000000, mileage: 8000, transmission: 'Tự động', fuel: 'Xăng', color: 'Trắng', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30A', createdAt: '2024-03-05', updatedAt: '2024-03-22', featured: true },
  { id: 6, name: 'Mercedes C200 Exclusive', slug: 'mercedes-c200', brand: 'Mercedes-Benz', model: 'C200', year: 2021, price: 1350000000, mileage: 30000, transmission: 'Tự động', fuel: 'Xăng', color: 'Đen', status: 'sold', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30A', createdAt: '2024-01-20', updatedAt: '2024-03-10', featured: false },
  { id: 7, name: 'Ford Ranger Wildtrak', slug: 'ford-ranger-wildtrak', brand: 'Ford', model: 'Ranger', year: 2022, price: 850000000, mileage: 20000, transmission: 'Tự động', fuel: 'Dầu', color: 'Cam', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '29C', createdAt: '2024-02-15', updatedAt: '2024-03-18', featured: false },
  { id: 8, name: 'VinFast VF8 Plus', slug: 'vinfast-vf8-plus', brand: 'VinFast', model: 'VF8', year: 2023, price: 1150000000, mileage: 5000, transmission: 'Tự động', fuel: 'Điện', color: 'Xám', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30K', createdAt: '2024-03-10', updatedAt: '2024-03-25', featured: true },
  { id: 9, name: 'Toyota Vios G CVT', slug: 'toyota-vios-g', brand: 'Toyota', model: 'Vios', year: 2023, price: 520000000, mileage: 15000, transmission: 'Tự động', fuel: 'Xăng', color: 'Bạc', status: 'inactive', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '29A', createdAt: '2024-02-28', updatedAt: '2024-03-20', featured: false },
  { id: 10, name: 'BMW X3 xDrive30i', slug: 'bmw-x3-xdrive30i', brand: 'BMW', model: 'X3', year: 2021, price: 1800000000, mileage: 25000, transmission: 'Tự động', fuel: 'Xăng', color: 'Trắng', status: 'active', condition: 'Đã qua sử dụng', images: ['/placeholder-car.jpg'], licensePlate: '30A', createdAt: '2024-01-25', updatedAt: '2024-03-12', featured: true },
];

// --- Categories ---
export const mockCategories: Category[] = [
  { id: 1, name: 'Toyota', slug: 'toyota', order: 1, status: 'active', count: 25 },
  { id: 2, name: 'Honda', slug: 'honda', order: 2, status: 'active', count: 18 },
  { id: 3, name: 'Mazda', slug: 'mazda', order: 3, status: 'active', count: 15 },
  { id: 4, name: 'Hyundai', slug: 'hyundai', order: 4, status: 'active', count: 20 },
  { id: 5, name: 'Kia', slug: 'kia', order: 5, status: 'active', count: 12 },
  { id: 6, name: 'Mercedes-Benz', slug: 'mercedes-benz', order: 6, status: 'active', count: 8 },
  { id: 7, name: 'BMW', slug: 'bmw', order: 7, status: 'active', count: 6 },
  { id: 8, name: 'Ford', slug: 'ford', order: 8, status: 'active', count: 10 },
  { id: 9, name: 'VinFast', slug: 'vinfast', order: 9, status: 'active', count: 7 },
  { id: 10, name: 'Mitsubishi', slug: 'mitsubishi', order: 10, status: 'active', count: 9 },
];

export const mockSubCategories: Category[] = [
  { id: 101, name: 'Camry', slug: 'camry', parentId: 1, order: 1, status: 'active', count: 8 },
  { id: 102, name: 'Vios', slug: 'vios', parentId: 1, order: 2, status: 'active', count: 6 },
  { id: 103, name: 'Corolla Cross', slug: 'corolla-cross', parentId: 1, order: 3, status: 'active', count: 5 },
  { id: 104, name: 'Fortuner', slug: 'fortuner', parentId: 1, order: 4, status: 'active', count: 6 },
  { id: 201, name: 'CR-V', slug: 'crv', parentId: 2, order: 1, status: 'active', count: 7 },
  { id: 202, name: 'City', slug: 'city', parentId: 2, order: 2, status: 'active', count: 5 },
  { id: 203, name: 'Civic', slug: 'civic', parentId: 2, order: 3, status: 'active', count: 6 },
  { id: 301, name: 'CX-5', slug: 'cx5', parentId: 3, order: 1, status: 'active', count: 8 },
  { id: 302, name: 'Mazda3', slug: 'mazda3', parentId: 3, order: 2, status: 'active', count: 7 },
];

// --- Mail ---
export const mockMails: Mail[] = [
  { id: 1, name: 'Nguyễn Văn An', phone: '0912345678', email: 'an@email.com', type: 'ban-xe', content: 'Tôi muốn bán xe Toyota Camry 2019', carName: 'Toyota Camry 2019', status: 'unread', createdAt: '2024-03-25 10:30' },
  { id: 2, name: 'Trần Thị Bình', phone: '0987654321', email: 'binh@email.com', type: 'ban-xe', content: 'Muốn bán Honda City 2022', carName: 'Honda City 2022', status: 'read', createdAt: '2024-03-24 14:20' },
  { id: 3, name: 'Lê Hoàng Cường', phone: '0909123456', type: 'len-doi', content: 'Muốn đổi xe cũ lên đời mới', currentCar: 'Kia Morning 2020', desiredCar: 'Hyundai Creta 2024', status: 'unread', createdAt: '2024-03-25 09:15' },
  { id: 4, name: 'Phạm Minh Đức', phone: '0918765432', type: 'goi-lai', carName: 'Mazda CX-5 2021', status: 'unread', createdAt: '2024-03-25 11:00' },
  { id: 5, name: 'Hoàng Thị Em', phone: '0932456789', email: 'em@email.com', type: 'goi-lai', carName: 'Toyota Fortuner 2022', status: 'read', createdAt: '2024-03-24 16:45' },
  { id: 6, name: 'Vũ Quang Phúc', phone: '0945678901', email: 'phuc@email.com', type: 'dang-ky', status: 'unread', createdAt: '2024-03-25 08:00' },
  { id: 7, name: 'Ngô Thanh Hà', phone: '0956789012', type: 'ban-xe', carName: 'Mercedes C200 2020', status: 'unread', createdAt: '2024-03-25 07:30' },
  { id: 8, name: 'Đặng Văn Lâm', phone: '0967890123', type: 'len-doi', currentCar: 'Toyota Vios 2021', desiredCar: 'Toyota Camry 2023', status: 'replied', createdAt: '2024-03-23 10:00' },
  { id: 9, name: 'Bùi Thị Mai', phone: '0978901234', email: 'mai@email.com', type: 'goi-lai', carName: 'Hyundai Accent 2023', status: 'unread', createdAt: '2024-03-25 12:30' },
  { id: 10, name: 'Cao Xuân Nam', phone: '0989012345', email: 'nam@email.com', type: 'dang-ky', status: 'read', createdAt: '2024-03-24 09:00' },
];

// --- Branches ---
export const mockBranches: Branch[] = [
  { id: 1, name: 'Chi nhánh Quận 7', address: '123 Nguyễn Thị Thập, Q.7, TP.HCM', phone: '028 1234 5678', order: 1, status: 'active' },
  { id: 2, name: 'Chi nhánh Thủ Đức', address: '456 Phạm Văn Đồng, TP.Thủ Đức, TP.HCM', phone: '028 9876 5432', order: 2, status: 'active' },
  { id: 3, name: 'Chi nhánh Bình Tân', address: '789 Kinh Dương Vương, Q.Bình Tân, TP.HCM', phone: '028 5555 6666', order: 3, status: 'active' },
];

// --- Services ---
export const mockServices: Service[] = [
  { id: 1, title: 'Mua bán xe ô tô', description: 'Chuyên mua bán các dòng xe ô tô đã qua sử dụng với giá tốt nhất', order: 1, status: 'active' },
  { id: 2, title: 'Lên đời xe', description: 'Hỗ trợ khách hàng lên đời xe với chính sách ưu đãi hấp dẫn', order: 2, status: 'active' },
  { id: 3, title: 'Tư vấn trả góp', description: 'Tư vấn và hỗ trợ thủ tục vay mua xe trả góp nhanh chóng', order: 3, status: 'active' },
  { id: 4, title: 'Bảo dưỡng xe', description: 'Dịch vụ bảo dưỡng xe uy tín, chất lượng', order: 4, status: 'active' },
];

// --- Testimonials ---
export const mockTestimonials: Testimonial[] = [
  { id: 1, name: 'Anh Nguyễn Minh', content: 'Tôi rất hài lòng với dịch vụ mua xe tại Toàn Trung. Nhân viên tư vấn nhiệt tình, xe đẹp đúng như mô tả.', rating: 5, carBought: 'Toyota Camry 2022', createdAt: '2024-03-15', status: 'active' },
  { id: 2, name: 'Chị Trần Thu', content: 'Quy trình mua bán nhanh gọn, giá cả hợp lý. Sẽ giới thiệu bạn bè đến mua xe tại đây.', rating: 5, carBought: 'Honda CR-V 2023', createdAt: '2024-03-10', status: 'active' },
  { id: 3, name: 'Anh Lê Phong', content: 'Dịch vụ lên đời xe rất tốt, đổi xe nhanh chóng, được hỗ trợ tận tình.', rating: 4, carBought: 'Mazda CX-5 2021', createdAt: '2024-02-28', status: 'active' },
];

// --- FAQ ---
export const mockFAQs: FAQ[] = [
  { id: 1, question: 'Quy trình mua xe tại Toàn Trung như thế nào?', answer: 'Bước 1: Chọn xe - Bước 2: Kiểm tra xe - Bước 3: Thỏa thuận giá - Bước 4: Hoàn tất thủ tục - Bước 5: Nhận xe', order: 1, status: 'active' },
  { id: 2, question: 'Có hỗ trợ trả góp không?', answer: 'Có, chúng tôi hỗ trợ trả góp lên đến 80% giá trị xe với lãi suất ưu đãi qua các ngân hàng liên kết.', order: 2, status: 'active' },
  { id: 3, question: 'Xe đã qua sử dụng có bảo hành không?', answer: 'Tất cả xe tại Toàn Trung đều được bảo hành 6-12 tháng tùy dòng xe. Cam kết chất lượng và nguồn gốc rõ ràng.', order: 3, status: 'active' },
  { id: 4, question: 'Có chính sách đổi trả không?', answer: 'Có, trong vòng 7 ngày nếu phát hiện lỗi kỹ thuật không đúng cam kết, chúng tôi sẽ hoàn tiền hoặc đổi xe.', order: 4, status: 'active' },
];

// --- News ---
export const mockNews: NewsArticle[] = [
  { id: 1, title: 'Top 10 xe ô tô đáng mua nhất 2024', slug: 'top-10-xe-dang-mua-2024', content: '<p>Nội dung bài viết...</p>', excerpt: 'Khám phá top 10 mẫu xe ô tô đáng mua nhất năm 2024 với chất lượng và giá cả hấp dẫn', category: 'Tư vấn', author: 'Admin', views: 1250, status: 'published', createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 2, title: 'Kinh nghiệm mua xe ô tô cũ cho người mới', slug: 'kinh-nghiem-mua-xe-cu', content: '<p>Nội dung bài viết...</p>', excerpt: 'Những kinh nghiệm quan trọng khi mua xe ô tô cũ dành cho người lần đầu', category: 'Kinh nghiệm', author: 'Admin', views: 890, status: 'published', createdAt: '2024-03-18', updatedAt: '2024-03-18' },
  { id: 3, title: 'Toàn Trung khai trương chi nhánh mới', slug: 'khai-truong-chi-nhanh-moi', content: '<p>Nội dung bài viết...</p>', excerpt: 'Chào mừng chi nhánh mới tại Thủ Đức với nhiều ưu đãi hấp dẫn', category: 'Tin tức', author: 'Admin', views: 560, status: 'published', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
];

// --- Recruitment ---
export const mockRecruitments: Recruitment[] = [
  { id: 1, title: 'Nhân viên kinh doanh ô tô', description: 'Tư vấn bán xe cho khách hàng', requirements: 'Tốt nghiệp CĐ trở lên, có kinh nghiệm bán hàng', salary: '10-20 triệu', location: 'TP.HCM', deadline: '2024-04-30', status: 'active', createdAt: '2024-03-01' },
  { id: 2, title: 'Kỹ thuật viên ô tô', description: 'Kiểm tra, bảo dưỡng xe', requirements: 'Có chứng chỉ nghề, kinh nghiệm 2 năm', salary: '12-18 triệu', location: 'TP.HCM', deadline: '2024-04-30', status: 'active', createdAt: '2024-03-05' },
];

// --- Customers ---
export const mockCustomers: Customer[] = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an@gmail.com', phone: '0912345678', address: 'Q.1, TP.HCM', status: 'active', createdAt: '2024-01-10', lastLogin: '2024-03-25' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh@gmail.com', phone: '0987654321', address: 'Q.7, TP.HCM', status: 'active', createdAt: '2024-02-15', lastLogin: '2024-03-24' },
  { id: 3, name: 'Lê Hoàng Cường', email: 'cuong@gmail.com', phone: '0909123456', address: 'Thủ Đức, TP.HCM', status: 'active', createdAt: '2024-03-01', lastLogin: '2024-03-23' },
  { id: 4, name: 'Phạm Đức Dũng', email: 'dung@gmail.com', phone: '0918765432', address: 'Bình Thạnh, TP.HCM', status: 'blocked', createdAt: '2024-01-20' },
  { id: 5, name: 'Hoàng Thị Em', email: 'em@gmail.com', phone: '0932456789', address: 'Q.3, TP.HCM', status: 'active', createdAt: '2024-02-28', lastLogin: '2024-03-25' },
];

// --- Slideshows ---
export const mockSlideshows: Slideshow[] = [
  { id: 1, title: 'Banner xe mới về', image: '/placeholder-banner.jpg', link: '/san-pham', order: 1, status: 'active' },
  { id: 2, title: 'Khuyến mãi tháng 3', image: '/placeholder-banner.jpg', link: '/khuyen-mai', order: 2, status: 'active' },
  { id: 3, title: 'Dịch vụ trả góp', image: '/placeholder-banner.jpg', link: '/tra-gop', order: 3, status: 'active' },
];

// --- Car Attributes ---
export const mockBodyStyles: CarAttribute[] = [
  { id: 1, name: 'Sedan', slug: 'sedan', order: 1, status: 'active' },
  { id: 2, name: 'SUV/Crossover', slug: 'suv', order: 2, status: 'active' },
  { id: 3, name: 'Hatchback', slug: 'hatchback', order: 3, status: 'active' },
  { id: 4, name: 'MPV/Minivan', slug: 'mpv', order: 4, status: 'active' },
  { id: 5, name: 'Bán tải', slug: 'ban-tai', order: 5, status: 'active' },
  { id: 6, name: 'Coupe', slug: 'coupe', order: 6, status: 'active' },
];

export const mockGearBoxes: CarAttribute[] = [
  { id: 1, name: 'Tự động (AT)', slug: 'tu-dong', order: 1, status: 'active' },
  { id: 2, name: 'Số sàn (MT)', slug: 'so-san', order: 2, status: 'active' },
  { id: 3, name: 'CVT', slug: 'cvt', order: 3, status: 'active' },
  { id: 4, name: 'Ly hợp kép (DCT)', slug: 'dct', order: 4, status: 'active' },
];

export const mockYears: CarAttribute[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1, name: `${2024 - i}`, slug: `${2024 - i}`, order: i + 1, status: 'active' as const,
}));

export const mockBudgets: CarAttribute[] = [
    { id: 1, name: 'Dưới 500 triệu', slug: 'duoi-500', order: 1, status: 'active' },
    { id: 2, name: '500 đến 700 triệu', slug: '500-den-700-trieu', order: 2, status: 'active' },
    { id: 3, name: '700 đến 1 tỷ', slug: '700-den-1-ty', order: 3, status: 'active' },
    { id: 4, name: 'Trên 1 tỷ', slug: 'tren-1-ty', order: 4, status: 'active' },
];

export const mockColors: CarAttribute[] = [
  { id: 1, name: 'Trắng', slug: 'trang', order: 1, status: 'active' },
  { id: 2, name: 'Đen', slug: 'den', order: 2, status: 'active' },
  { id: 3, name: 'Bạc/Xám', slug: 'bac-xam', order: 3, status: 'active' },
  { id: 4, name: 'Đỏ', slug: 'do', order: 4, status: 'active' },
  { id: 5, name: 'Xanh', slug: 'xanh', order: 5, status: 'active' },
  { id: 6, name: 'Nâu', slug: 'nau', order: 6, status: 'active' },
];

export const mockLicensePlates: CarAttribute[] = [
  { id: 1, name: 'Biển tỉnh', slug: 'bien-tinh', order: 1, status: 'active' },
  { id: 2, name: 'Biển thành phố', slug: 'bien-thanh-pho', order: 2, status: 'active' },
  { id: 3, name: 'Biển Hà Nội', slug: 'bien-ha-noi', order: 3, status: 'active' },
];

export const mockConditions: CarAttribute[] = [
  { id: 1, name: 'Đã nhận cọc', slug: 'da-nhan-coc', order: 1, status: 'active' },
  { id: 2, name: 'Xe đã bán', slug: 'xe-da-ban', order: 2, status: 'active' },
];

export const mockMileages: CarAttribute[] = [
  { id: 1, name: 'Dưới 30.000', slug: 'duoi-30000', order: 1, status: 'active' },
  { id: 2, name: 'Dưới 50.000', slug: 'duoi-50000', order: 2, status: 'active' },
  { id: 3, name: 'Dưới 70.000', slug: 'duoi-70000', order: 3, status: 'active' },
  { id: 4, name: 'Dưới 100.000', slug: 'duoi-100000', order: 4, status: 'active' },
];

// --- Dashboard Stats ---
export const mockDashboardStats: DashboardStats = {
  totalProducts: 156,
  totalMails: 2961,
  totalViews: 45820,
  totalCustomers: 1234,
  recentMails: mockMails.slice(0, 5),
  monthlyViews: [
    { month: 'T1', views: 3200 }, { month: 'T2', views: 4100 }, { month: 'T3', views: 3800 },
    { month: 'T4', views: 5200 }, { month: 'T5', views: 4800 }, { month: 'T6', views: 6100 },
    { month: 'T7', views: 5500 }, { month: 'T8', views: 7200 }, { month: 'T9', views: 6800 },
    { month: 'T10', views: 8100 }, { month: 'T11', views: 7500 }, { month: 'T12', views: 9200 },
  ],
  topProducts: mockProducts.slice(0, 5),
};

// Helper: format price
export function formatPrice(price: number): string {
  if (price >= 1000000000) {
    const ty = price / 1000000000;
    return ty % 1 === 0 ? `${ty} tỷ` : `${ty.toFixed(1)} tỷ`;
  }
  return `${(price / 1000000).toFixed(0)} triệu`;
}

// Helper: format number with dots
export function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

// Helper: format date
export { formatDate } from './date';
