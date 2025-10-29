export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  created_at: string;
}

export interface Classification {
  id: number;
  user_id: number;
  item_name: string;
  description: string;
  condition: 'working' | 'dead' | 'unknown';
  image_path?: string;
  category: 'disposal' | 'donate' | 'marketplace' | 'repair';
  created_at: string;
}

export interface Disposal {
  id: number;
  user_id: number;
  classification_id: number;
  disposal_method: 'pickup' | 'drop-off';
  pickup_date?: string;
  pickup_location?: string;
  vendor_filter: string;
  status: string;
  created_at: string;
}

export interface Donation {
  id: number;
  user_id: number;
  classification_id: number;
  location: string;
  organization: string;
  status: string;
  created_at: string;
}

export interface MarketplaceItem {
  id: number;
  user_id: number;
  classification_id: number;
  title: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: number;
  images: string[];
  specifications: Record<string, string>;
  warranty_info?: string;
  seller_name: string;
  seller_rating: number;
  is_selling: boolean;
  status: string;
  created_at: string;
}

export interface RepairShop {
  name: string;
  address: string;
  rating: number;
  specialties: string[];
  phone: string;
  hours: string;
  warranty: string;
  price_range: string;
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
  }>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Vendor {
  name: string;
  location: string;
  rating: number;
  pickup: boolean;
}

export interface DonationOrganization {
  name: string;
  type: string;
  description: string;
  location: string;
  contact: string;
  image: string;
}



export interface ClassificationCreate {
  item_name: string;
  description: string;
  condition: 'working' | 'dead' | 'unknown';
  category: 'disposal' | 'donate' | 'marketplace' | 'repair';
}

export interface DisposalCreate {
  classification_id: number;
  disposal_method: 'pickup' | 'drop-off';
  pickup_date?: string;
  pickup_location?: string;
  vendor_filter: string;
  selected_vendor?: string;
}

export interface DonationCreate {
  classification_id: number;
  location: string;
  organization: string;
}

export interface MarketplaceItemCreate {
  classification_id: number;
  title: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: number;
  images?: string[];
  specifications?: Record<string, string>;
  warranty_info?: string;
  is_selling: boolean;
}

export interface PurchaseFormData {
  marketplace_item_id: number;
  shipping_address: string;
  phone_number: string;
  payment_method: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
}

export interface Purchase {
  id: number;
  user_id: number;
  marketplace_item_id: number;
  purchase_price: number;
  shipping_address: string;
  phone_number: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  icon: string;
}

export interface RepairFAQ {
  question: string;
  answer: string;
}