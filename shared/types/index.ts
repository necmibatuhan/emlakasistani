export interface User {
  id: string;
  company_id?: string;
  office_id?: string;
  email: string;
  name: string;
  role: 'agent' | 'office_manager' | 'company_manager' | 'admin' | 'demo';
  plan: 'free' | 'starter' | 'pro' | 'proplus';
  is_verified: boolean;
  referral_code?: string;
  referred_by_id?: string;
  kvkk_consent_at?: Date | string;
  created_at: Date | string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  budget?: number;
  preferences?: Record<string, any>;
  score?: number;
  label?: 'Sıcak' | 'Ilık' | 'Soğuk';
  reasoning?: string;
  recommended_action?: string;
  status: 'yeni' | 'görüşüldü' | 'sunum_yapıldı' | 'teklif_verildi' | 'satış_kiralama_başarılı' | 'iptal';
  created_at: Date | string;
}

export interface Property {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  features?: Record<string, any>;
  images?: string[];
  status: 'aktif' | 'pasif' | 'satıldı' | 'kiralandı';
  created_at: Date | string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
