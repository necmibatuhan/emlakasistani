import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifreniz en az 6 karakter olmalıdır.'),
  name: z.string().min(2, 'Adınız en az 2 karakter olmalıdır.'),
  role: z.enum(['agent', 'office_manager', 'company_manager', 'admin', 'demo']).optional(),
  kvkkAccepted: z.boolean().refine(val => val === true, {
    message: 'Devam etmek için KVKK Aydınlatma Metnini onaylamanız gerekmektedir.',
  }),
  referralCode: z.string().optional(),
  turnstileToken: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
  turnstileToken: z.string().optional()
});

export const leadSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır.'),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.').optional().or(z.literal('')),
  source: z.string().optional(),
  budget: z.number().positive().optional(),
  status: z.enum(['yeni', 'görüşüldü', 'sunum_yapıldı', 'teklif_verildi', 'satış_kiralama_başarılı', 'iptal']).optional(),
  preferences: z.any().optional()
});

export const propertySchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır.'),
  description: z.string().optional(),
  price: z.number().positive('Fiyat 0 dan büyük olmalıdır.').optional(),
  location: z.string().optional(),
  status: z.enum(['aktif', 'pasif', 'satıldı', 'kiralandı']).optional(),
  features: z.any().optional(),
  images: z.array(z.string()).optional()
});
