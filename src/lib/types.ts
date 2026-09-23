// Types for the admin panel

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  mileage: number;
  transmission: string;
  fuel: string;
  color: string;
  status: 'active' | 'inactive' | 'deposit' | 'sold';
  condition: string;
  images: string[];
  description?: string;
  licensePlate?: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  installment?: boolean;
  newArrival?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  image?: string;
  order: number;
  status: 'active' | 'inactive';
  count?: number;
}

export interface Mail {
  id: number;
  name: string;
  phone: string;
  email?: string;
  type: 'ban-xe' | 'len-doi' | 'goi-lai' | 'dang-ky';
  content?: string;
  carName?: string;
  currentCar?: string;
  desiredCar?: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  mapUrl?: string;
  image?: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  avatar?: string;
  carBought?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  category: string;
  author: string;
  views: number;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface Recruitment {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary?: string;
  location: string;
  deadline: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: 'active' | 'blocked';
  createdAt: string;
  lastLogin?: string;
}

export interface Slideshow {
  id: number;
  title: string;
  image: string;
  link?: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface SEOConfig {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    zalo?: string;
    instagram?: string;
    tiktok?: string;
  };
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalMails: number;
  totalViews: number;
  totalCustomers: number;
  recentMails: Mail[];
  monthlyViews: { month: string; views: number }[];
  topProducts: Product[];
}

export interface CarAttribute {
  id: number;
  name: string;
  slug: string;
  order: number;
  status: 'active' | 'inactive';
}

export type BodyStyle = CarAttribute;
export type ManufactureYear = CarAttribute;
export type GearBox = CarAttribute;
export type Budget = CarAttribute & { minPrice?: number; maxPrice?: number };
export type CarCondition = CarAttribute;
export type Mileage = CarAttribute & { minKm?: number; maxKm?: number };
export type LicensePlateType = CarAttribute;
export type CarColor = CarAttribute & { colorCode?: string };
